import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  addDoc,
  collection,
  getDocs,
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
          <div className="welcome-art">
            <div className="art-icon">
              <Cross size={38} />
            </div>
            <span>LOVE GOD · LOVE PEOPLE</span>
          </div>
          <div>
            <span className="eyebrow">WELCOME TO NCC DUNSTABLE</span>
            <h2>
              Faith grows
              <br />
              better <em>together.</em>
            </h2>
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
        <section className="service-band" id="service-times">
          <div className="service-intro">
            <span className="eyebrow">JOIN US THIS WEEK</span>
            <h2>
              Make room for
              <br />
              <em>what matters.</em>
            </h2>
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
          <div className="section-heading">
            <div>
              <span className="eyebrow">LIFE AT NCC DUNSTABLE</span>
              <h2>
                Find your place
                <br />
                <em>to belong.</em>
              </h2>
            </div>
            <p>
              There are many ways to connect, grow, and take part in church
              life.
            </p>
          </div>
          <div className="feature-grid">
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
        <section className="sermon-teaser">
          <div>
            <span className="eyebrow">LISTEN AND GROW</span>
            <h2>
              Truth for the
              <br />
              <em>journey ahead.</em>
            </h2>
            <p>
              Explore messages from our church community. Sermon recordings will
              appear here as they are added.
            </p>
            <Link className="button button-light" to="/sermons">
              Explore sermons <Play size={16} />
            </Link>
          </div>
          <div className="sermon-visual">
            <div className="play-circle">
              <Play fill="currentColor" />
            </div>
            <span>MESSAGES · FAITH · LIFE</span>
          </div>
        </section>
        <Cta />
      </main>
    </Layout>
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
      <section className="section about-body">
        <div>
          <span className="eyebrow">WHO WE ARE</span>
          <h2>
            Rooted in Jesus.
            <br />
            <em>Open to everyone.</em>
          </h2>
        </div>
        <div>
          <p>
            We believe church is more than a Sunday gathering. It is a family
            where people can find belonging, grow in faith, and discover how to
            serve others. Our heart is to create a space where every generation
            can encounter God and build meaningful relationships.
          </p>
          <p>
            Our local gathering is taking shape in Dunstable. We look forward to
            sharing more about our story, leadership, and community as details
            are confirmed.
          </p>
          <Link className="inline-link" to="/contact">
            Come and meet us <ArrowRight size={16} />
          </Link>
        </div>
      </section>
      <section className="leaders-section" aria-labelledby="leaders-title">
        <div className="leaders-heading">
          <span className="eyebrow">LEADERSHIP</span>
          <h2 id="leaders-title">Our Leaders</h2>
        </div>
        <div className="leaders-grid">
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
      <section className="values">
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
  const [items, setItems] = useState<RecordItem[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error" | "setup">(
    firebaseConfigured ? "loading" : "setup",
  );
  const [error, setError] = useState("");
  useEffect(() => {
    if (!db) return;
    let active = true;
    getDocs(query(collection(db, collectionName), orderBy("createdAt", "desc")))
      .then((s) => {
        if (active) {
          setItems(
            s.docs.map((d) => ({ id: d.id, ...d.data() }) as RecordItem),
          );
          setState("ready");
        }
      })
      .catch((e) => {
        if (active) {
          setError(e instanceof Error ? e.message : "Could not load content.");
          setState("error");
        }
      });
    return () => {
      active = false;
    };
  }, [collectionName]);
  return (
    <Layout>
      <PageIntro eyebrow="CHURCH LIFE" title={name} text={text} />
      <section className="section listing">
        <div className="section-heading">
          <div>
            <span className="eyebrow">NCC DUNSTABLE</span>
            <h2>
              {name}, <em>together.</em>
            </h2>
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
          <div className="feature-grid">
            {items.map((item) => (
              <article className="feature-card" key={item.id}>
                {item.imageUrl && (
                  <img className="record-image" src={item.imageUrl} alt="" />
                )}
                <Icon size={25} />
                <h3>{item.title || "Untitled"}</h3>
                {item.date && <small>{item.date}</small>}
                <p>{item.description}</p>
                {item.speaker && <small>With {item.speaker}</small>}
              </article>
            ))}
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
    const data = new FormData(e.currentTarget);
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
      e.currentTarget.reset();
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
      <section className="section contact-layout">
        <div className="contact-info">
          <span className="eyebrow">GET IN TOUCH</span>
          <h2>
            Let's start
            <br />
            <em>a conversation.</em>
          </h2>
          <p>
            Our contact details are being confirmed. You can still send a
            message here and we will be in touch.
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
    const d = new FormData(e.currentTarget);
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
      e.currentTarget.reset();
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
      <section className="section give-layout">
        <div>
          <span className="eyebrow">GIVING AT NCC DUNSTABLE</span>
          <h2>
            Thank you for
            <br />
            <em>your generosity.</em>
          </h2>
          <p>
            Giving details for NCC Dunstable are being arranged. No online
            payment provider is connected yet, so this page will not take
            payments.
          </p>
          <div className="notice">
            <Heart />
            <div>
              <b>Payment setup pending</b>
              <p>
                Bank transfer and payment provider instructions will be added
                once confirmed by the church.
              </p>
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
