import { useEffect, useState, type FormEvent } from "react";
import { youtubeEmbedUrl } from "../lib/youtube";
import { SplitText } from "../components/SplitText";
import { Link } from "react-router-dom";
import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import {
  ArrowRight,
  Heart,
  CalendarDays,
  Clock3,
  MapPin,
  Play,
  Cross,
  HandHeart,
  Users,
  BookOpen,
  type LucideIcon,
} from "lucide-react";
import { church } from "../config";
import { db, firebaseConfigured, firebaseSetupMessage } from "../lib/firebase";
import {
  describeRecurrence,
  formatDay,
  formatTime,
  isRecurring,
  nextOccurrence,
  type Recurrence,
} from "../lib/recurrence";
import { usePagedCollection } from "../lib/usePagedCollection";
import { Layout } from "../components/SiteLayout";
import { PageIntro, Cta } from "../components/PageSections";
import Hero from "../components/Hero";

type IconComponent = LucideIcon;

export function Home() {
  return (
    <Layout>
      <main>
        <Hero />
        <section className="welcome section">
          <div className="welcome-art" data-reveal="left">
            <div className="art-icon">
              <Cross size={38} />
            </div>
            <span>LOVE GOD · LOVE PEOPLE</span>
          </div>
          <div data-reveal="right">
            <span className="eyebrow">WELCOME TO NCC DUNSTABLE</span>
            <h2 data-lines=""><SplitText>
              Faith grows
              <br />
              better <em>together.</em>
            </SplitText></h2>
            <p>
              Whether you are exploring faith, returning to church, or looking
              for a church family, there is a warm welcome waiting for you. We
              are building a community centred on Jesus and committed to serving
              Dunstable.
            </p>
            <Link className="inline-link" to="/about">
              More about our church <ArrowRight size={16} />
            </Link>
          </div>
        </section>
        <section className="service-band" id="service-times" data-stagger="up">
          <div className="service-intro">
            <span className="eyebrow">JOIN US THIS WEEK</span>
            <h2 data-lines=""><SplitText>
              Make room for
              <br />
              <em>what matters.</em>
            </SplitText></h2>
            <p>Gather with us for worship, prayer, and time together.</p>
          </div>
          <div className="service-detail">
            <CalendarDays />
            <div>
              <b>Sunday worship</b>
              <span>{church.Sunday}</span>
            </div>
          </div>
          <div className="service-detail">
            <Clock3 />
            <div>
              <b>Midweek gathering</b>
              <span>{church.midweek}</span>
            </div>
          </div>
          <div className="service-detail">
            <MapPin />
            <div>
              <b>Find us</b>
              <span>{church.address}</span>
            </div>
          </div>
          <Link className="button" to="/contact">
            Plan your visit <ArrowRight size={17} />
          </Link>
        </section>
        <section className="section content-section">
          <div className="section-heading" data-reveal="up">
            <div>
              <span className="eyebrow">LIFE AT NCC DUNSTABLE</span>
              <h2 data-lines=""><SplitText>
                Find your place
                <br />
                <em>to belong.</em>
              </SplitText></h2>
            </div>
            <p>
              There are many ways to connect, grow, and take part in church
              life.
            </p>
          </div>
          <div className="feature-grid feature-grid-two" data-stagger="up">
            {(
              [
                {
                  Icon: BookOpen,
                  title: "Sermons",
                  desc: "Biblical teaching to encourage you through the week.",
                  path: "/sermons",
                },
                {
                  Icon: CalendarDays,
                  title: "Events",
                  desc: "Gather, celebrate, and build friendships together.",
                  path: "/events",
                },
                // {
                //   Icon: Users,
                //   title: "Ministries",
                //   desc: "Discover the ways you can grow and serve.",
                //   path: "/ministries",
                // },
              ] satisfies {
                Icon: IconComponent;
                title: string;
                desc: string;
                path: string;
              }[]
            ).map(({ Icon, title, desc, path }) => (
              <Link to={path} className="feature-card" key={title}>
                <Icon size={28} />
                <span className="eyebrow">EXPLORE</span>
                <h3>{title}</h3>
                <p>{desc}</p>
                <ArrowRight className="feature-arrow" />
              </Link>
            ))}
          </div>
        </section>
        <LatestSermon />
        <Cta />
      </main>
    </Layout>
  );
}

function LatestSermon() {
  const [sermon, setSermon] = useState<RecordItem | null>(null);
  useEffect(() => {
    if (!db) return;
    let active = true;
    getDocs(
      query(collection(db, "sermons"), orderBy("createdAt", "desc"), limit(1)),
    )
      .then((snapshot) => {
        const first = snapshot.docs[0];
        if (active && first)
          setSermon({ id: first.id, ...first.data() } as RecordItem);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);
  const embed = youtubeEmbedUrl(sermon?.videoUrl);
  const posted = sermon?.date ? new Date(sermon.date) : null;
  const dateLabel =
    posted && !Number.isNaN(posted.getTime())
      ? posted.toLocaleDateString("en-GB", { dateStyle: "long" })
      : sermon?.date;
  return (
    <section className="sermon-teaser" data-stagger="up">
      <div>
        {sermon ? (
          <>
            <span className="eyebrow">LATEST SERMON</span>
            <h2 data-lines="" className="sermon-title"><SplitText>{sermon.title || "Latest message"}</SplitText></h2>
            <p className="sermon-meta">
              {[dateLabel, sermon.speaker && `With ${sermon.speaker}`]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {sermon.description && (
              <p className="sermon-excerpt">{sermon.description}</p>
            )}
            <Link className="button button-light" to="/sermons">
              More sermons <Play size={16} />
            </Link>
          </>
        ) : (
          <>
            <span className="eyebrow">LISTEN AND GROW</span>
            <h2 data-lines=""><SplitText>
              Truth for the
              <br />
              <em>journey ahead.</em>
            </SplitText></h2>
            <p>Explore Bible teaching and messages from our church community.</p>
            <Link className="button button-light" to="/sermons">
              Explore sermons <Play size={16} />
            </Link>
          </>
        )}
      </div>
      {embed ? (
        <div className="sermon-visual has-video">
          <div className="video-embed">
            <iframe
              src={embed}
              title={sermon?.title || "Latest sermon"}
              loading="lazy"
              allow="encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      ) : sermon?.imageUrl ? (
        <div className="sermon-visual has-image">
          <img src={sermon.imageUrl} alt="" />
        </div>
      ) : (
        <div className="sermon-visual">
          <div className="play-circle">
            <Play fill="currentColor" />
          </div>
          <span>MESSAGES · FAITH · LIFE</span>
        </div>
      )}
    </section>
  );
}

export function About() {
  return (
    <Layout>
      <PageIntro
        eyebrow="OUR CHURCH"
        title="A family of faith in Dunstable."
        text="New Covenant Church Dunstable is a welcoming Christian community seeking to know Jesus and make his love known."
      />
      <section className="section about-body" data-stagger="up">
        <div>
          <span className="eyebrow">WHO WE ARE</span>
          <h2 data-lines=""><SplitText>
            Rooted in Jesus.
            <br />
            <em>Open to everyone.</em>
          </SplitText></h2>
        </div>
        <div>
          <p>
            We believe church is more than a Sunday gathering. It is a family
            where people can find belonging, grow in faith, and discover how to
            serve others. Our heart is to create a space where every generation
            can encounter God and build meaningful relationships.
          </p>
          <p>
            We meet for worship every Sunday at {church.Sunday} and for Bible
            study on Tuesday evenings. Come as you are, say hello, and meet the
            family.
          </p>
          <Link className="inline-link" to="/contact">
            Come and meet us <ArrowRight size={16} />
          </Link>
        </div>
      </section>
      <section className="leaders-section" aria-labelledby="leaders-title">
        <div className="leaders-heading" data-reveal="up">
          <span className="eyebrow">LEADERSHIP</span>
          <h2 data-lines="" id="leaders-title"><SplitText>Our Leaders</SplitText></h2>
        </div>
        <div className="leaders-grid" data-stagger="up">
          <article className="leader-card">
            <img
              src="/images/lead.png"
              alt="Pastor Sunday and Faderera Olatunji"
            />
            <div className="leader-card-copy">
              <span className="eyebrow">LEAD PASTORS</span>
              <h3>Pastor Sunday and Faderera Olatunji</h3>
            </div>
          </article>
          <article className="leader-card">
            <img
              src="/images/associate.jpg"
              alt="Pastor Peter and Dorcas Oni"
            />
            <div className="leader-card-copy">
              <span className="eyebrow">ASSOCIATE PASTORS</span>
              <h3>Pastor Peter and Dorcas Oni</h3>
            </div>
          </article>
          <article className="leader-card">
            <img src="/images/leader.jpg" alt="Mrs Modupe Ijasan" />
            <div className="leader-card-copy">
              <span className="eyebrow">LEADER</span>
              <h3>Mrs Modupe Ijasan</h3>
            </div>
          </article>
        </div>
      </section>
      <section className="values" data-stagger="up">
        <div className="value">
          <Cross />
          <h3>Jesus at the centre</h3>
          <p>We follow Jesus and build our lives on his teaching.</p>
        </div>
        <div className="value">
          <Heart />
          <h3>A place to belong</h3>
          <p>We welcome people at every stage of their faith journey.</p>
        </div>
        <div className="value">
          <HandHeart />
          <h3>Here to serve</h3>
          <p>We want to bring practical care and hope to our neighbours.</p>
        </div>
      </section>
      <Cta />
    </Layout>
  );
}

type RecordItem = {
  id: string;
  title?: string;
  description?: string;
  date?: string;
  speaker?: string;
  imageUrl?: string;
  videoUrl?: string;
  time?: string;
  recurrence?: Recurrence;
  weekday?: number;
  weekOfMonth?: number;
};
function CollectionPage({
  name,
  collectionName,
  text,
  icon: Icon,
}: {
  name: string;
  collectionName: string;
  text: string;
  icon: IconComponent;
}) {
  const { items, loading, loadingMore, hasMore, error, loadMore } =
    usePagedCollection<RecordItem>(collectionName);
  const state: "loading" | "ready" | "error" | "setup" = !firebaseConfigured
    ? "setup"
    : loading
      ? "loading"
      : error && !items.length
        ? "error"
        : "ready";
  return (
    <Layout>
      <PageIntro eyebrow="CHURCH LIFE" title={name} text={text} />
      <section className="section listing">
        <div className="section-heading">
          <div>
            <span className="eyebrow">NCC DUNSTABLE</span>
            <h2 data-lines=""><SplitText>
              {name}, <em>together.</em>
            </SplitText></h2>
          </div>
        </div>
        {state === "loading" && (
          <p className="state-message">Loading {name.toLowerCase()}…</p>
        )}
        {state === "setup" && (
          <p className="state-message">{firebaseSetupMessage}</p>
        )}
        {state === "error" && (
          <p className="state-error">We could not load this content: {error}</p>
        )}
        {state === "ready" && !items.length && (
          <div className="empty-state">
            <Icon size={28} />
            <h3>More to come</h3>
            <p>
              {name} will be shared here as the church calendar and media
              library are set up.
            </p>
          </div>
        )}
        {items.length > 0 && (
          <div className="feature-grid" data-stagger="up">
            {items.map((item) => (
              <article className="feature-card" key={item.id}>
                {youtubeEmbedUrl(item.videoUrl) ? (
                  <div className="video-embed">
                    <iframe
                      src={youtubeEmbedUrl(item.videoUrl)!}
                      title={item.title || "Sermon video"}
                      loading="lazy"
                      allow="encrypted-media; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  item.imageUrl && (
                    <img className="record-image" src={item.imageUrl} alt="" />
                  )
                )}
                <Icon size={25} />
                <h3>{item.title || "Untitled"}</h3>
                {isRecurring(item) ? (
                  <>
                    <small>
                      <b>{describeRecurrence(item)}</b>
                      {item.time && ` · ${formatTime(item.time)}`}
                    </small>
                    {nextOccurrence(item) && (
                      <small>Next: {formatDay(nextOccurrence(item)!)}</small>
                    )}
                  </>
                ) : (
                  (item.date || item.time) && (
                    <small>
                      {[item.date, formatTime(item.time)]
                        .filter(Boolean)
                        .join(" · ")}
                    </small>
                  )
                )}
                <p>{item.description}</p>
                {item.speaker && <small>With {item.speaker}</small>}
              </article>
            ))}
          </div>
        )}
        {state === "ready" && error && (
          <p className="state-error">We could not load more: {error}</p>
        )}
        {hasMore && (
          <div className="load-more">
            <button
              className="button"
              onClick={loadMore}
              disabled={loadingMore}
            >
              {loadingMore ? "Loading…" : "Load more"}
            </button>
          </div>
        )}
      </section>
      <Cta />
    </Layout>
  );
}
// export function Ministries() {
//   return (
//     <CollectionPage
//       name="Ministries"
//       collectionName="ministries"
//       text="Find ways to grow in faith, build friendships, and serve the Dunstable community."
//       icon={Users}
//     />
//   );
// }
export function Sermons() {
  return (
    <CollectionPage
      name="Sermons"
      collectionName="sermons"
      text="Listen to Bible teaching and messages from the NCC Dunstable community."
      icon={BookOpen}
    />
  );
}
export function Events() {
  return (
    <CollectionPage
      name="Events"
      collectionName="events"
      text="See what is coming up and find a reason to gather with us."
      icon={CalendarDays}
    />
  );
}

export function Contact() {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("");
    setError("");
    if (!db) {
      setError(firebaseSetupMessage);
      return;
    }
    const form = e.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    try {
      await addDoc(collection(db, "messages"), {
        name: data.get("name"),
        email: data.get("email"),
        subject: data.get("subject"),
        message: data.get("message"),
        createdAt: serverTimestamp(),
        status: "new",
      });
      setStatus("Thank you. Your message has been sent to the church team.");
      form.reset();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We could not send your message. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Layout>
      <PageIntro
        eyebrow="SAY HELLO"
        title="We would love to hear from you."
        text="Planning a visit, asking a question, or looking for prayer? Send us a message."
      />
      <section className="section contact-layout" data-stagger="up">
        <div className="contact-info">
          <span className="eyebrow">GET IN TOUCH</span>
          <h2 data-lines=""><SplitText>
            Let's start
            <br />
            <em>a conversation.</em>
          </SplitText></h2>
          <p>
            Send us a message using the form, or reach us directly on{" "}
            <a href={`tel:${church.phone}`}>{church.phone}</a> or at{" "}
            <a href={`mailto:${church.email}`}>{church.email}</a>.
          </p>
          <div className="contact-detail">
            <MapPin />
            <div>
              <b>Location</b>
              <span>
                {church.address}
                <br />
                {church.location}
              </span>
            </div>
          </div>
          <div className="contact-detail">
            <Clock3 />
            <div>
              <b>Gathering times</b>
              <span>
                Sunday: {church.Sunday}
                <br />
                Midweek: {church.midweek}
              </span>
            </div>
          </div>
        </div>
        <form className="form-card" onSubmit={submit}>
          <h3>Send us a message</h3>
          <label>
            Your name
            <input name="name" required minLength={2} autoComplete="name" />
          </label>
          <label>
            Email address
            <input name="email" type="email" required autoComplete="email" />
          </label>
          <label>
            Subject
            <input name="subject" required />
          </label>
          <label>
            How can we help?
            <textarea name="message" rows={5} required minLength={10} />
          </label>
          {error && (
            <p role="alert" className="state-error">
              {error}
            </p>
          )}
          {status && (
            <p role="status" className="state-success">
              {status}
            </p>
          )}
          <button className="button" disabled={busy}>
            {busy ? "Sending…" : "Send message"} <ArrowRight size={17} />
          </button>
        </form>
      </section>
    </Layout>
  );
}
export function Give() {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setStatus("");
    if (!db) {
      setError(firebaseSetupMessage);
      return;
    }
    const form = e.currentTarget;
    const d = new FormData(form);
    setBusy(true);
    try {
      await addDoc(collection(db, "donations"), {
        amount: Number(d.get("amount")),
        currency: "GBP",
        name: d.get("name"),
        email: d.get("email"),
        note: d.get("note"),
        status: "pledge-recorded-no-payment",
        createdAt: serverTimestamp(),
      });
      setStatus(
        "Your giving intention has been recorded. No payment was taken.",
      );
      form.reset();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We could not record this intention.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Layout>
      <PageIntro
        eyebrow="GIVE"
        title="Generosity makes a difference."
        text="Thank you for being part of what God is doing through the church and in our community."
      />
      <section className="section give-layout" data-stagger="up">
        <div>
          <span className="eyebrow">GIVING AT NCC DUNSTABLE</span>
          <h2 data-lines=""><SplitText>
            Thank you for
            <br />
            <em>your generosity.</em>
          </SplitText></h2>
          <p>
            Online card payments are not available yet, so this page does not
            take payments. You can give by bank transfer using the details
            below, and optionally let the church team know using the form.
          </p>
          <div className="notice">
            <Heart />
            <div>
              <b>Give by bank transfer</b>
              <p>{church.bank.purpose}</p>
              <dl className="bank-details">
                <div>
                  <dt>Bank</dt>
                  <dd>{church.bank.name}</dd>
                </div>
                <div>
                  <dt>Account no.</dt>
                  <dd>{church.bank.accountNumber}</dd>
                </div>
                <div>
                  <dt>Sort code</dt>
                  <dd>{church.bank.sortCode}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
        <form className="form-card" onSubmit={submit}>
          <h3>Record a giving intention</h3>
          <p className="form-hint">
            This saves a note for the church team only. It does not charge you
            or initiate a payment.
          </p>
          <label>
            Your name
            <input name="name" required autoComplete="name" />
          </label>
          <label>
            Email address
            <input name="email" type="email" required autoComplete="email" />
          </label>
          <label>
            Intended amount (£)
            <input name="amount" type="number" required min="1" step="0.01" />
          </label>
          <label>
            Note (optional)
            <textarea name="note" rows={3} />
          </label>
          {error && (
            <p role="alert" className="state-error">
              {error}
            </p>
          )}
          {status && (
            <p role="status" className="state-success">
              {status}
            </p>
          )}
          <button className="button" disabled={busy}>
            {busy ? "Saving…" : "Save giving intention"}
            <ArrowRight size={17} />
          </button>
        </form>
      </section>
    </Layout>
  );
}
export function NotFound() {
  return (
    <Layout>
      <PageIntro
        eyebrow="404"
        title="This page isn't here."
        text="The page you are looking for may have moved. Let's help you find your way."
      />
      <div className="center-action">
        <Link className="button" to="/">
          Return home <ArrowRight size={17} />
        </Link>
      </div>
    </Layout>
  );
}
