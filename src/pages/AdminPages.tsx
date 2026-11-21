import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { addDoc, collection, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc, doc, updateDoc, type Timestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { ArrowRight } from "lucide-react";
import { church } from "../config";
import { auth, db, firebaseConfigured, firebaseSetupMessage, storage } from "../lib/firebase";

type RecordItem = { id: string; title?: string; description?: string; date?: string; speaker?: string; imageUrl?: string };
type ContactMessage = {
  id: string;
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  status?: string;
  createdAt?: Timestamp;
};
type GivingIntention = {
  id: string;
  amount?: number;
  currency?: string;
  name?: string;
  email?: string;
  note?: string;
  status?: string;
  createdAt?: Timestamp;
};

function RequireAuth({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  useEffect(() => {
    if (!auth || !db) {
      setLoading(false);
      return;
    }
    let active = true;
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (!active) return;
      setUser(u);
      setAuthorized(false);
      if (!u) {
        setLoading(false);
        return;
      }
      try {
        const membership = await getDoc(doc(db, "admins", u.uid));
        if (active) setAuthorized(membership.exists());
      } catch {
        if (active) setAuthorized(false);
      } finally {
        if (active) setLoading(false);
      }
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);
  if (loading) return <div className="admin-shell">Checking sign in…</div>;
  if (!firebaseConfigured)
    return (
      <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
    );
  if (user && !authorized) {
    return (
      <div className="admin-shell">
        <div className="form-card admin-card">
          <span className="eyebrow">ADMIN AREA</span>
          <h1>Access not enabled</h1>
          <p>This account has not been approved to manage church content.</p>
          <button className="button" onClick={() => auth && signOut(auth)}>
            Sign out
          </button>
          <Link className="inline-link" to="/">
            Back to website
          </Link>
        </div>
      </div>
    );
  }
  return user && authorized ? (
    <>{children}</>
  ) : (
    <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  );
}
export function AdminLogin() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!auth) {
      setError(firebaseSetupMessage);
      return;
    }
    const d = new FormData(e.currentTarget);
    setBusy(true);
    try {
      await signInWithEmailAndPassword(
        auth,
        String(d.get("email")),
        String(d.get("password")),
      );
      navigate("/admin/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Sign in failed. Check your details and try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="admin-shell">
      <Link className="brand admin-brand" to="/">
        <img src={church.logo} alt="" />
        <span>
          <b>NCC DUNSTABLE</b>
          <small>ADMINISTRATION</small>
        </span>
      </Link>
      <form className="form-card admin-card" onSubmit={submit}>
        <span className="eyebrow">ADMIN AREA</span>
        <h1>Sign in</h1>
        <p>Use your church administrator account.</p>
        {!firebaseConfigured && (
          <p className="state-error">{firebaseSetupMessage}</p>
        )}
        <label>
          Email address
          <input name="email" type="email" required autoComplete="username" />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
        </label>
        {error && (
          <p role="alert" className="state-error">
            {error}
          </p>
        )}
        <button className="button" disabled={busy || !firebaseConfigured}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <Link className="inline-link" to="/">
          Back to website
        </Link>
      </form>
    </div>
  );
}
function Dashboard() {
  const [records, setRecords] = useState<Record<string, RecordItem[]>>({
    sermons: [],
    events: [],
    ministries: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [givingIntentions, setGivingIntentions] = useState<GivingIntention[]>([]);
  const [updatingMessage, setUpdatingMessage] = useState<string | null>(null);
  useEffect(() => {
    if (!db) {
      setLoading(false);
      setError(firebaseSetupMessage);
      return;
    }
    const firestore = db;
    const contentRequest = Promise.all(
      ["sermons", "events", "ministries"].map(async (kind) => {
        const result = await getDocs(
          query(collection(firestore, kind), orderBy("createdAt", "desc")),
        );
        return [
          kind,
          result.docs.map(
            (entry) => ({ id: entry.id, ...entry.data() }) as RecordItem,
          ),
        ] as const;
      }),
    );
    const messagesRequest = getDocs(
      query(collection(firestore, "messages"), orderBy("createdAt", "desc")),
    );
    const givingRequest = getDocs(
      query(collection(firestore, "donations"), orderBy("createdAt", "desc")),
    );
    Promise.all([contentRequest, messagesRequest, givingRequest])
      .then(([entries, messageSnapshot, givingSnapshot]) => {
        setRecords(Object.fromEntries(entries));
        setMessages(
          messageSnapshot.docs.map(
            (entry) => ({ id: entry.id, ...entry.data() }) as ContactMessage,
          ),
        );
        setGivingIntentions(
          givingSnapshot.docs.map(
            (entry) => ({ id: entry.id, ...entry.data() }) as GivingIntention,
          ),
        );
      })
      .catch((reason: unknown) =>
        setError(
          reason instanceof Error ? reason.message : "Could not load content.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);
  async function markMessageRead(messageId: string) {
    if (!db) return;
    setUpdatingMessage(messageId);
    try {
      await updateDoc(doc(db, "messages", messageId), { status: "read" });
      setMessages((current) =>
        current.map((message) =>
          message.id === messageId ? { ...message, status: "read" } : message,
        ),
      );
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Could not update the message.",
      );
    } finally {
      setUpdatingMessage(null);
    }
  }
  return (
    <div className="admin-shell admin-dashboard">
      <div className="admin-top">
        <div>
          <span className="eyebrow">NCC DUNSTABLE</span>
          <h1>Content dashboard</h1>
        </div>
        <button
          className="button button-outline"
          onClick={() => auth && signOut(auth)}
        >
          Sign out
        </button>
      </div>
      <p>
        Manage public church content. New entries appear on the matching page.
      </p>
      {error && (
        <p role="alert" className="state-error">
          {error}
        </p>
      )}
      {loading && <p>Loading content…</p>}
      <div className="admin-links">
        {(["sermons", "events", "ministries"] as const).map((kind) => (
          <section className="admin-link-card" key={kind}>
            <h2>{kind[0].toUpperCase() + kind.slice(1)}</h2>
            <Link className="button" to={`/admin/${kind}/add`}>
              Add {kind.slice(0, -1)}
            </Link>
            <ul className="admin-record-list">
              {records[kind].map((record) => (
                <li key={record.id}>
                  <span>{record.title || "Untitled"}</span>
                  <Link to={`/admin/${kind}/edit/${record.id}`}>Edit</Link>
                </li>
              ))}
            </ul>
            {!loading && records[kind].length === 0 && (
              <p className="form-hint">No items yet.</p>
            )}
          </section>
        ))}
      </div>
      <section className="admin-inbox" aria-labelledby="inbox-title">
        <div className="admin-inbox-heading">
          <div>
            <span className="eyebrow">INCOMING</span>
            <h2 id="inbox-title">Contact messages</h2>
          </div>
          <span className="admin-inbox-count">
            {messages.filter((message) => message.status !== "read").length} unread
          </span>
        </div>
        {loading ? (
          <p className="form-hint">Loading messages…</p>
        ) : messages.length === 0 ? (
          <p className="form-hint">No contact messages yet.</p>
        ) : (
          <div className="admin-message-list">
            {messages.map((message) => (
              <article
                className={`admin-message ${message.status === "read" ? "is-read" : "is-unread"}`}
                key={message.id}
              >
                <div className="admin-message-heading">
                  <div>
                    <h3>{message.subject || "No subject"}</h3>
                    <p>
                      {message.name || "Unknown sender"}
                      {message.email && (
                        <>
                          {" · "}
                          <a href={`mailto:${message.email}`}>{message.email}</a>
                        </>
                      )}
                    </p>
                  </div>
                  {message.status !== "read" && (
                    <button
                      className="button button-outline admin-message-read"
                      onClick={() => markMessageRead(message.id)}
                      disabled={updatingMessage === message.id}
                    >
                      {updatingMessage === message.id ? "Updating…" : "Mark read"}
                    </button>
                  )}
                </div>
                <p className="admin-message-body">{message.message}</p>
                {message.createdAt && (
                  <time dateTime={message.createdAt.toDate().toISOString()}>
                    {message.createdAt.toDate().toLocaleString()}
                  </time>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
      <section className="admin-inbox" aria-labelledby="giving-title">
        <div className="admin-inbox-heading">
          <div>
            <span className="eyebrow">GIVING</span>
            <h2 id="giving-title">Giving intentions</h2>
          </div>
          <span className="admin-inbox-count">
            {givingIntentions.length} recorded
          </span>
        </div>
        {loading ? (
          <p className="form-hint">Loading giving intentions…</p>
        ) : givingIntentions.length === 0 ? (
          <p className="form-hint">No giving intentions yet.</p>
        ) : (
          <div className="admin-message-list">
            {givingIntentions.map((intention) => (
              <article className="admin-message" key={intention.id}>
                <div className="admin-message-heading">
                  <div>
                    <h3>
                      {new Intl.NumberFormat("en-GB", {
                        style: "currency",
                        currency: intention.currency || "GBP",
                      }).format(intention.amount || 0)}
                    </h3>
                    <p>
                      {intention.name || "Unknown giver"}
                      {intention.email && (
                        <>
                          {" · "}
                          <a href={`mailto:${intention.email}`}>
                            {intention.email}
                          </a>
                        </>
                      )}
                    </p>
                  </div>
                  <span className="admin-inbox-count">Intention recorded · No payment taken</span>
                </div>
                {intention.note && (
                  <p className="admin-message-body">{intention.note}</p>
                )}
                {intention.createdAt && (
                  <time dateTime={intention.createdAt.toDate().toISOString()}>
                    {intention.createdAt.toDate().toLocaleString()}
                  </time>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
      <Link className="inline-link" to="/">
        View public site <ArrowRight size={16} />
      </Link>
    </div>
  );
}
function ContentEditor() {
  const { type = "sermons", id } = useParams();
  const validType = (["sermons", "events", "ministries"] as const).includes(
    type as "sermons" | "events" | "ministries",
  );
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState("");
  const [values, setValues] = useState<RecordItem>({
    id: "",
    title: "",
    description: "",
    date: "",
    speaker: "",
    imageUrl: "",
  });
  const edit = Boolean(id);
  const title = type.slice(0, -1);
  useEffect(() => {
    if (!id || !db || !validType) {
      setLoading(false);
      return;
    }
    getDoc(doc(db, type, id))
      .then((snapshot) => {
        if (snapshot.exists())
          setValues({ id, ...snapshot.data() } as RecordItem);
        else setError("This content item could not be found.");
      })
      .catch((reason: unknown) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "Could not load this item.",
        ),
      )
      .finally(() => setLoading(false));
  }, [id, type, validType]);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!db || !storage) {
      setError(firebaseSetupMessage);
      return;
    }
    if (!validType) {
      setError("Choose sermons, events, or ministries.");
      return;
    }
    const form = e.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    try {
      const file = data.get("image");
      let imageUrl = String(data.get("imageUrl") || "");
      if (file instanceof File && file.size > 0) {
        const imageRef = ref(
          storage,
          `${type}/${crypto.randomUUID()}-${file.name}`,
        );
        await uploadBytes(imageRef, file);
        imageUrl = await getDownloadURL(imageRef);
      }
      const content = {
        title: data.get("title"),
        description: data.get("description"),
        date: data.get("date"),
        speaker: data.get("speaker"),
        imageUrl,
        createdAt: serverTimestamp(),
      };
      if (id) await setDoc(doc(db, type, id), content, { merge: true });
      else await addDoc(collection(db, type), content);
      navigate("/admin/dashboard");
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Could not save this item.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (!validType) return <Navigate to="/admin/dashboard" replace />;
  return (
    <div className="admin-shell">
      <Link className="inline-link" to="/admin/dashboard">
        ← Dashboard
      </Link>
      <form className="form-card admin-card" onSubmit={submit}>
        <span className="eyebrow">CONTENT MANAGEMENT</span>
        <h1>
          {edit ? "Edit" : "Add"} {title}
        </h1>
        {loading ? (
          <p>Loading item…</p>
        ) : (
          <>
            <label>
              Title
              <input name="title" required defaultValue={values.title} />
            </label>
            <label>
              Description
              <textarea
                name="description"
                rows={5}
                required
                defaultValue={values.description}
              />
            </label>
            <label>
              Date
              <input name="date" type="date" defaultValue={values.date} />
            </label>
            {type === "sermons" && (
              <label>
                Speaker
                <input name="speaker" defaultValue={values.speaker} />
              </label>
            )}
            <label>
              Image URL (optional)
              <input
                name="imageUrl"
                type="url"
                defaultValue={values.imageUrl}
              />
            </label>
            <label>
              Or upload an image
              <input name="image" type="file" accept="image/*" />
            </label>
            {values.imageUrl && (
              <img
                className="admin-preview"
                src={values.imageUrl}
                alt="Current content"
              />
            )}
          </>
        )}
        {error && (
          <p role="alert" className="state-error">
            {error}
          </p>
        )}
        <button className="button" disabled={busy || loading}>
          {busy ? "Saving…" : "Save"}
        </button>
      </form>
    </div>
  );
}
export function AdminRoute() {
  return (
    <RequireAuth>
      <Routes>
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/:type/add" element={<ContentEditor />} />
        <Route path="/admin/:type/edit/:id" element={<ContentEditor />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </RequireAuth>
  );
}
