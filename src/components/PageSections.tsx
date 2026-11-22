import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { SplitText } from "./SplitText";

export function PageIntro({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <section className="page-intro">
      <span className="eyebrow">{eyebrow}</span>
      <h1 data-lines=""><SplitText>{title}</SplitText></h1>
      <p>{text}</p>
    </section>
  );
}
export function Cta({
  title = "There is a place for you here.",
  text = "Come as you are. We would love to meet you.",
  button = "Plan your visit",
}: {
  title?: string;
  text?: string;
  button?: string;
}) {
  return (
    <section className="cta" data-stagger="up">
      <div>
        <span className="eyebrow">YOU ARE WELCOME</span>
        <h2 data-lines=""><SplitText>{title}</SplitText></h2>
        <p>{text}</p>
      </div>
      <Link className="button button-light" to="/contact">
        {button}
        <ArrowRight size={17} />
      </Link>
    </section>
  );
}
