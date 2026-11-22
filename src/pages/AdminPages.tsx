import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { addDoc, collection, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc, doc, updateDoc, type Timestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { ArrowRight, BookOpen, CalendarDays, Check, ExternalLink, HandCoins, LayoutDashboard, LogOut, Mail, Pencil, Plus, Users, type LucideIcon } from "lucide-react";
import { church } from "../config";
import { youtubeEmbedUrl } from "../lib/youtube";
import { auth, db, firebaseConfigured, firebaseSetupMessage, storage } from "../lib/firebase";

type RecordItem = { id: string; title?: string; description?: string; date?: string; speaker?: string; imageUrl?: string; videoUrl?: string };
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

type DashView = "overview" | "sermons" | "events" | "ministries" | "messages" | "giving";

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
  const [view, setView] = useState<DashView>("overview");
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
  const unreadCount = messages.filter(
    (message) => message.status !== "read",
  ).length;
  const totalContent = Object.values(records).reduce(
    (total, items) => total + items.length,
    0,
  );
  const kinds = ["sermons", "events", "ministries"] as const;
  const views: { key: DashView; label: string; icon: LucideIcon; count?: number; alert?: boolean }[] = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "sermons", label: "Sermons", icon: BookOpen, count: records.sermons.length },
    { key: "events", label: "Events", icon: CalendarDays, count: records.events.length },
    { key: "ministries", label: "Ministries", icon: Users, count: records.ministries.length },
    { key: "messages", label: "Messages", icon: Mail, count: unreadCount, alert: unreadCount > 0 },
    { key: "giving", label: "Giving", icon: HandCoins, count: givingIntentions.length },
  ];
  const current = views.find((v) => v.key === view)!;
  const singular = (kind: string) => kind.slice(0, -1);
  const money = (item: GivingIntention) =>
    new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: item.currency || "GBP",
    }).format(item.amount || 0);
  const when = (stamp?: Timestamp) =>
    stamp ? stamp.toDate().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "";

  function MessageCard({ message }: { message: ContactMessage }) {
    const unread = message.status !== "read";
    return (
      <article className={`dash-message ${unread ? "is-unread" : ""}`}>
        <div className="dash-message-top">
          <div>
            <h3>
              {unread && <span className="dash-dot" aria-label="Unread" />}
              {message.subject || "No subject"}
            </h3>
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
          {unread && (
            <button
              className="dash-btn"
              onClick={() => markMessageRead(message.id)}
              disabled={updatingMessage === message.id}
            >
              <Check size={14} />
              {updatingMessage === message.id ? "Updating…" : "Mark read"}
            </button>
          )}
        </div>
        <p className="dash-message-body">{message.message}</p>
        <time>{when(message.createdAt)}</time>
      </article>
    );
  }

  function ContentList({ kind }: { kind: (typeof kinds)[number] }) {
    const items = records[kind];
    return (
      <>
        {!loading && items.length === 0 ? (
          <div className="dash-empty">
            <p>No {kind} yet.</p>
            <Link className="dash-btn dash-btn-primary" to={`/admin/${kind}/add`}>
              <Plus size={15} /> Add {singular(kind)}
            </Link>
          </div>
        ) : (
          <ul className="dash-list">
            {items.map((item) => (
              <li key={item.id}>
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt="" className="dash-thumb" />
                ) : (
                  <span className="dash-thumb dash-thumb-empty" aria-hidden="true" />
                )}
                <div className="dash-list-main">
                  <b>{item.title || "Untitled"}</b>
                  <span>
                    {[item.date, item.speaker].filter(Boolean).join(" · ") ||
                      (item.description ? item.description.slice(0, 80) : "No details")}
                  </span>
                </div>
                <Link className="dash-btn" to={`/admin/${kind}/edit/${item.id}`}>
                  <Pencil size={14} /> Edit
                </Link>
              </li>
            ))}
          </ul>
        )}
      </>
    );
  }

  return (
    <div className="dash">
      <aside className="dash-side">
        <Link className="dash-brand" to="/">
          <img src={church.logo} alt="" />
          <span>
            <b>NCC DUNSTABLE</b>
            <small>ADMINISTRATION</small>
          </span>
        </Link>
        <nav className="dash-nav" aria-label="Admin sections">
          {views.map(({ key, label, icon: Icon, count, alert }) => (
            <button
              key={key}
              className={view === key ? "is-active" : ""}
              aria-current={view === key ? "page" : undefined}
              onClick={() => setView(key)}
            >
              <Icon size={17} />
              <span>{label}</span>
              {count !== undefined && !loading && (
                <em className={alert ? "is-alert" : ""}>{count}</em>
              )}
            </button>
          ))}
        </nav>
        <div className="dash-side-foot">
          <Link to="/">
            <ExternalLink size={15} /> View public site
          </Link>
          <button onClick={() => auth && signOut(auth)}>
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>

      <main className="dash-main">
        <header className="dash-head">
          <div>
            <span className="eyebrow">{view === "overview" ? "WELCOME BACK" : "MANAGE"}</span>
            <h1>{view === "overview" ? "Dashboard" : current.label}</h1>
          </div>
          {(kinds as readonly string[]).includes(view) && (
            <Link className="dash-btn dash-btn-primary" to={`/admin/${view}/add`}>
              <Plus size={15} /> Add {singular(view)}
            </Link>
          )}
        </header>

        {error && (
          <p role="alert" className="state-error">
            {error}
          </p>
        )}
        {loading && <p className="dash-muted">Loading…</p>}

        {view === "overview" && (
          <>
            <section className="dash-stats" aria-label="Overview">
              <button className="dash-stat" onClick={() => setView("messages")}>
                <Mail size={18} />
                <strong>{loading ? "—" : unreadCount}</strong>
                <span>Unread messages</span>
              </button>
              <div className="dash-stat">
                <BookOpen size={18} />
                <strong>{loading ? "—" : totalContent}</strong>
                <span>Published items</span>
              </div>
              <button className="dash-stat" onClick={() => setView("giving")}>
                <HandCoins size={18} />
                <strong>{loading ? "—" : givingIntentions.length}</strong>
                <span>Giving intentions</span>
              </button>
            </section>

            <div className="dash-cols">
              <section className="dash-card">
                <div className="dash-card-head">
                  <h2>Recent messages</h2>
                  <button className="dash-link" onClick={() => setView("messages")}>
                    View all <ArrowRight size={14} />
                  </button>
                </div>
                {!loading && messages.length === 0 ? (
                  <p className="dash-muted">No contact messages yet.</p>
                ) : (
                  <div className="dash-stack">
                    {messages.slice(0, 3).map((m) => (
                      <MessageCard key={m.id} message={m} />
                    ))}
                  </div>
                )}
              </section>

              <section className="dash-card">
                <div className="dash-card-head">
                  <h2>Quick add</h2>
                </div>
                <div className="dash-quick">
                  {kinds.map((kind) => (
                    <Link key={kind} to={`/admin/${kind}/add`}>
                      <Plus size={16} />
                      New {singular(kind)}
                    </Link>
                  ))}
                </div>
                <p className="dash-muted dash-note">
                  New entries appear on the matching public page straight away.
                </p>
              </section>
            </div>
          </>
        )}

        {(kinds as readonly string[]).includes(view) && (
          <section className="dash-card">
            <ContentList kind={view as (typeof kinds)[number]} />
          </section>
        )}

        {view === "messages" && (
          <section className="dash-stack">
            {!loading && messages.length === 0 && (
              <div className="dash-card dash-empty">
                <p>No contact messages yet.</p>
              </div>
            )}
            {messages.map((m) => (
              <MessageCard key={m.id} message={m} />
            ))}
          </section>
        )}

        {view === "giving" && (
          <section className="dash-card">
            <p className="dash-muted dash-note">
              These are pledges only. No payments are processed through the website.
            </p>
            {!loading && givingIntentions.length === 0 ? (
              <div className="dash-empty">
                <p>No giving intentions yet.</p>
              </div>
            ) : (
              <ul className="dash-list">
                {givingIntentions.map((g) => (
                  <li key={g.id}>
                    <span className="dash-amount">{money(g)}</span>
                    <div className="dash-list-main">
                      <b>{g.name || "Unknown giver"}</b>
                      <span>
                        {g.email && <a href={`mailto:${g.email}`}>{g.email}</a>}
                        {g.note && ` · ${g.note}`}
                      </span>
                    </div>
                    <time>{when(g.createdAt)}</time>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </main>
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
    videoUrl: "",
  });
  const [videoInput, setVideoInput] = useState("");
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
          {
          const loaded = { id, ...snapshot.data() } as RecordItem;
          setValues(loaded);
          setVideoInput(loaded.videoUrl ?? "");
        }
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
    const videoUrl = String(data.get("videoUrl") || "").trim();
    if (type === "sermons" && !youtubeEmbedUrl(videoUrl)) {
      setError(
        videoUrl
          ? "That doesn't look like a valid YouTube link."
          : "A YouTube link is required for sermons.",
      );
      return;
    }
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
        ...(type === "sermons" ? { videoUrl } : {}),
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
            {type === "sermons" && (
              <>
                <label>
                  YouTube link
                  <input
                    name="videoUrl"
                    type="url"
                    required
                    placeholder="https://www.youtube.com/watch?v=…"
                    value={videoInput}
                    onChange={(e) => setVideoInput(e.target.value)}
                  />
                </label>
                {youtubeEmbedUrl(videoInput) ? (
                  <div className="video-embed">
                    <iframe
                      src={youtubeEmbedUrl(videoInput)!}
                      title="Sermon video preview"
                      allow="encrypted-media; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  videoInput.trim() && (
                    <p className="state-error">Not a recognised YouTube link.</p>
                  )
                )}
              </>
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
        <Route path="dashboard" element={<Dashboard />} />
        <Route path=":type/add" element={<ContentEditor />} />
        <Route path=":type/edit/:id" element={<ContentEditor />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </RequireAuth>
  );
}
