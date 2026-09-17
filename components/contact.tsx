"use client";

import { useRef, useState, type FormEvent } from "react";
import Script from "next/script";
import { CheckCircle2, Mail, MapPin, Phone } from "lucide-react";
import { org } from "@/lib/content";
import { safeHref } from "@/lib/href";
import { Section } from "./section";
import { Socials } from "./socials";

type Field = "name" | "email" | "phone" | "message";
type Errors = Partial<Record<Field, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Duplicated from app/api/contact/route.ts on purpose — same idiom as the
// EMAIL regex above: the client copy gives instant feedback, the server
// copy is the one that actually matters and never trusts this one.
const MAX_NAME = 120;
const MAX_EMAIL = 200;
const MAX_PHONE = 30;
const MAX_MESSAGE = 5000;

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

function validate(values: Record<Field, string>): Errors {
  const errors: Errors = {};

  if (!values.name.trim()) errors.name = "Please enter your name.";
  else if (values.name.trim().length > MAX_NAME) errors.name = "Name is too long.";

  if (!values.email.trim()) errors.email = "Please enter your email address.";
  else if (!EMAIL.test(values.email.trim()))
    errors.email = "Enter a valid email address, for example name@example.com.";
  else if (values.email.trim().length > MAX_EMAIL) errors.email = "Email is too long.";

  // Phone is optional, but if given it must look like a phone number.
  if (values.phone.trim()) {
    if (!/^[\d\s()+.-]{7,}$/.test(values.phone.trim()))
      errors.phone = "Enter a valid phone number, or leave this blank.";
    else if (values.phone.trim().length > MAX_PHONE) errors.phone = "Phone number is too long.";
  }

  if (!values.message.trim()) errors.message = "Please enter a message.";
  else if (values.message.trim().length < 10)
    errors.message = "Please write at least 10 characters so we can help.";
  else if (values.message.trim().length > MAX_MESSAGE)
    errors.message = `Message is too long — please keep it under ${MAX_MESSAGE} characters.`;

  return errors;
}

const empty: Record<Field, string> = {
  name: "",
  email: "",
  phone: "",
  message: "",
};

type Props = { title: string; subtitle: string };

export function ContactSection({ title, subtitle }: Props) {
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);

  const set = (field: Field, value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    // Clear an existing error as soon as the user fixes it.
    if (errors[field]) {
      setErrors((e) => ({ ...e, [field]: validate({ ...values, [field]: value })[field] }));
    }
  };

  // Resolves to undefined (never throws) when reCAPTCHA isn't configured or
  // hasn't loaded yet — the API route itself skips verification in that
  // case, same degrade-don't-throw convention used throughout this route.
  const getRecaptchaToken = async (): Promise<string | undefined> => {
    if (!RECAPTCHA_SITE_KEY || !window.grecaptcha) return undefined;
    return new Promise((resolve) => {
      window.grecaptcha!.ready(() => {
        window
          .grecaptcha!.execute(RECAPTCHA_SITE_KEY, { action: "contact" })
          .then(resolve)
          .catch(() => resolve(undefined));
      });
    });
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    setSendError(null);

    const first = (Object.keys(found) as Field[])[0];
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      setSent(false);
      return;
    }

    setSending(true);
    try {
      const recaptchaToken = await getRecaptchaToken();
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          company: honeypotRef.current?.value,
          recaptchaToken,
        }),
      });
      const data: { ok?: boolean; error?: string } = await res.json();
      if (!res.ok || !data.ok) {
        setSendError(data.error || "Something went wrong. Please try again.");
        setSent(false);
        return;
      }
      setSent(true);
      setValues(empty);
    } catch {
      setSendError("Something went wrong. Please try again.");
      setSent(false);
    } finally {
      setSending(false);
    }
  };

  return (
    <Section id="contact" title={title} subtitle={subtitle} headingLevel="h1">
      {RECAPTCHA_SITE_KEY && (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`}
          strategy="afterInteractive"
        />
      )}
      <div className="grid gap-12 lg:grid-cols-[1fr_minmax(0,22rem)]">
        {sent ? (
          <div
            role="status"
            aria-live="polite"
            className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-surface p-7 text-center sm:p-9"
          >
            <CheckCircle2 aria-hidden className="size-12 text-accent" />
            <p className="text-lg font-semibold text-foreground">
              Thanks for contacting us! We will be in touch with you shortly.
            </p>
            <button
              type="button"
              onClick={() => setSent(false)}
              className="mt-2 cursor-pointer rounded-full border border-border px-6 py-2.5 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-surface-2"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form
            ref={formRef}
            onSubmit={onSubmit}
            noValidate
            aria-label="Contact form"
            className="rounded-2xl border border-border bg-surface p-7 sm:p-9"
          >
            {/* Honeypot — hidden from real visitors, bots fill every field. */}
            <input
              ref={honeypotRef}
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute left-[-9999px] h-0 w-0 opacity-0"
            />

            <div className="grid gap-6 sm:grid-cols-2">
              <TextField
                name="name"
                label="Name"
                required
                autoComplete="name"
                maxLength={MAX_NAME}
                value={values.name}
                error={errors.name}
                onChange={set}
              />
              <TextField
                name="email"
                label="Email"
                type="email"
                required
                autoComplete="email"
                maxLength={MAX_EMAIL}
                value={values.email}
                error={errors.email}
                onChange={set}
              />
              <div className="sm:col-span-2">
                <TextField
                  name="phone"
                  label="Phone"
                  type="tel"
                  autoComplete="tel"
                  hint="Optional — include it if you would rather we call."
                  maxLength={MAX_PHONE}
                  value={values.phone}
                  error={errors.phone}
                  onChange={set}
                />
              </div>
              <div className="sm:col-span-2">
                <TextField
                  name="message"
                  label="Message"
                  required
                  multiline
                  maxLength={MAX_MESSAGE}
                  value={values.message}
                  error={errors.message}
                  onChange={set}
                />
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="submit"
                disabled={sending}
                className="cursor-pointer rounded-full bg-gradient-to-r from-primary to-accent px-7 py-3.5 text-base font-semibold text-on-primary shadow-lg shadow-primary/25 transition-[filter,transform] duration-200 hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {sending ? "Sending…" : "Send message"}
              </button>
              <p className="text-sm text-muted-foreground">
                <span aria-hidden className="text-destructive">
                  *
                </span>{" "}
                marks a required field.
              </p>
            </div>

            {sendError && (
              <p role="alert" className="mt-6 text-sm font-medium text-destructive">
                {sendError}
              </p>
            )}
          </form>
        )}

        <div className="space-y-8">
          <div className="rounded-2xl border border-border bg-surface-2 p-7">
            <h3 className="text-lg font-semibold">Reach us directly</h3>
            <ul className="mt-5 space-y-4">
              <li>
                <a
                  href={safeHref(org.phoneHref)}
                  className="flex items-center gap-3 text-muted-foreground transition-colors duration-200 hover:text-foreground"
                >
                  <Phone aria-hidden className="size-5 shrink-0 text-accent" />
                  <span className="font-medium text-foreground">{org.phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={safeHref(org.emailHref)}
                  className="flex items-center gap-3 text-muted-foreground transition-colors duration-200 hover:text-foreground"
                >
                  <Mail aria-hidden className="size-5 shrink-0 text-accent" />
                  <span className="font-medium break-all text-foreground">
                    {org.email}
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={safeHref(org.mapUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-3 text-muted-foreground transition-colors duration-200 hover:text-foreground"
                >
                  <MapPin aria-hidden className="mt-0.5 size-5 shrink-0 text-accent" />
                  <span className="font-medium text-foreground">{org.address}</span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Follow along</h3>
            <Socials className="mt-4" />
          </div>
        </div>
      </div>
    </Section>
  );
}

type FieldProps = {
  name: Field;
  label: string;
  value: string;
  error?: string;
  onChange: (field: Field, value: string) => void;
  type?: string;
  required?: boolean;
  multiline?: boolean;
  hint?: string;
  autoComplete?: string;
  maxLength?: number;
};

function TextField({
  name,
  label,
  value,
  error,
  onChange,
  type = "text",
  required,
  multiline,
  hint,
  autoComplete,
  maxLength,
}: FieldProps) {
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;
  const describedBy =
    [error && errorId, hint && hintId].filter(Boolean).join(" ") || undefined;

  const shared = {
    id: name,
    name,
    value,
    required,
    autoComplete,
    maxLength,
    "aria-invalid": error ? (true as const) : undefined,
    "aria-describedby": describedBy,
    onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => onChange(name, e.target.value),
    className: `w-full rounded-xl border bg-background px-4 py-3 text-base text-foreground transition-colors duration-200 placeholder:text-muted-foreground ${
      error ? "border-destructive" : "border-border"
    }`,
  };

  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-sm font-semibold">
        {label}
        {required && (
          <span aria-hidden className="ml-1 text-destructive">
            *
          </span>
        )}
      </label>

      {multiline ? (
        <textarea {...shared} rows={5} />
      ) : (
        <input {...shared} type={type} />
      )}

      {hint && (
        <p id={hintId} className="mt-2 text-sm text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-2 text-sm font-medium text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
}
