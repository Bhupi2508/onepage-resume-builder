import { Link } from "react-router-dom";

const Page = ({ title, children }) => (
  <article className="mx-auto max-w-3xl px-4 py-10">
    <h1 className="text-3xl font-extrabold">{title}</h1>
    <div className="mt-4 space-y-4 text-slate-700 dark:text-slate-300 [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-slate-900 dark:[&_h2]:text-white [&_ul]:list-disc [&_ul]:pl-5">{children}</div>
  </article>
);

export const About = () => (
  <Page title="About">
    <p>OnePage Resume Builder helps anyone — school students, college students, freshers, experienced professionals, freelancers and career changers — create a clean, ATS-friendly, one-page resume without design or technical skills.</p>
    <h2>Our principles</h2>
    <ul>
      <li><strong>Free.</strong> No paid plans, credits, watermarks or premium-only templates.</li>
      <li><strong>One page.</strong> A4 layout with a live page-fit meter. We never shrink text below 9pt or silently drop your content.</li>
      <li><strong>Private by default.</strong> You can build and download without an account. See the <Link to="/privacy" className="underline">privacy policy</Link>.</li>
      <li><strong>ATS-friendly.</strong> Single-column layouts with real, selectable text in standard fonts.</li>
    </ul>
    <p><Link to="/demo" className="font-semibold text-indigo-600 underline">Try the demo</Link> or <Link to="/builder/new" className="font-semibold text-indigo-600 underline">start your resume</Link>.</p>
  </Page>
);

export const Contact = () => (
  <Page title="Contact">
    <p>This is an open-source project maintained by volunteers. There is no support inbox or contact form on this site, so nothing you type here is sent anywhere.</p>
    <p>Found a bug or want a feature? Please open an issue in the project’s source repository. If you run your own copy of this app, put your own support address here.</p>
    <h2>Account help</h2>
    <p>Password reset by email is not available. If you are locked out, create a new account; the app’s operator can remove old data on request.</p>
  </Page>
);

export const Privacy = () => (
  <Page title="Privacy policy">
    <p>We collect as little as possible. This page describes what this application actually does.</p>
    <h2>Without an account</h2>
    <ul>
      <li>Your draft is stored only in your browser (local storage). Demo data is stored only in your browser tab (session storage).</li>
      <li>When you download a PDF, your resume content is sent to the server to generate the file. It is not stored or logged.</li>
    </ul>
    <h2>With an account</h2>
    <ul>
      <li>We store your name, email, a salted bcrypt hash of your password, and the resumes you save.</li>
      <li>A session cookie (HTTP-only) keeps you signed in. It is not used for tracking.</li>
      <li>You can delete your resumes at any time, or delete your account in Settings, which permanently removes all your data.</li>
    </ul>
    <h2>What we don’t do</h2>
    <ul><li>No advertising, analytics trackers, or selling of data. We recommend leaving out sensitive details such as date of birth, home address or ID numbers; the builder doesn’t ask for them.</li></ul>
  </Page>
);

export const Terms = () => (
  <Page title="Terms of use">
    <p>By using this service you agree to the following simple terms.</p>
    <ul>
      <li>The service is provided free of charge and “as is”, without warranties. Keep your own copy of important documents.</li>
      <li>You are responsible for the accuracy of the information on your resume.</li>
      <li>Don’t abuse the service (automated bulk requests, attempts to access other users’ data, or uploading unlawful content).</li>
      <li>You own your content. We only use it to provide the features you ask for.</li>
      <li>Accounts that abuse the service may be removed.</li>
    </ul>
  </Page>
);
