"use client";

import { useRef, useState, type FormEvent } from "react";
import { CheckCircle2, Mail, Phone } from "lucide-react";
import { contact, org } from "@/lib/content";
import { Section } from "./section";
import { Socials } from "./socials";

type Field = "name" | "email" | "phone" | "message";
type Errors = Partial<Record<Field, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(values: Record<Field, string>): Errors {
  const errors: Errors = {};

  if (!values.name.trim()) errors.name = "Please enter your name.";

  if (!values.email.trim()) errors.email = "Please enter your email address.";
  else if (!EMAIL.test(values.email.trim()))
    errors.email = "Enter a valid email address, for example name@example.com.";

  // Phone is optional, but if given it must look like a phone number.
  if (values.phone.trim() && !/^[\d\s()+.-]{7,}$/.test(values.phone.trim()))
    errors.phone = "Enter a valid phone number, or leave this blank.";

  if (!values.message.trim()) errors.message = "Please enter a message.";
  else if (values.message.trim().length < 10)
    errors.message = "Please write at least 10 characters so we can help.";

  return errors;
}

const empty: Record<Field, string> = {
  name: "",
  email: "",
  phone: "",
  message: "",
};

export function ContactSection() {
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const set = (field: Field, value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    // Clear an existing error as soon as the user fixes it.
    if (errors[field]) {
      setErrors((e) => ({ ...e, [field]: validate({ ...values, [field]: value })[field] }));
    }
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);

    const first = (Object.keys(found) as Field[])[0];
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      setSent(false);
      return;
    }

    // ponytail: no backend yet — swap this for a POST to /api/contact.
    setSent(true);
    setValues(empty);
  };

  return (
    <Section id="contact" title={contact.title} subtitle={contact.subtitle}>
      <div className="grid gap-12 lg:grid-cols-[1fr_minmax(0,22rem)]">
        <form
          ref={formRef}
          onSubmit={onSubmit}
          noValidate
          aria-label="Contact form"
          className="rounded-2xl border border-border bg-surface p-7 sm:p-9"
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <TextField
              name="name"
              label="Name"
              required
              autoComplete="name"
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
                value={values.message}
                error={errors.message}
                onChange={set}
              />
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="submit"
              className="cursor-pointer rounded-full bg-gradient-to-r from-primary to-accent px-7 py-3.5 text-base font-semibold text-on-primary shadow-lg shadow-primary/25 transition-[filter,transform] duration-200 hover:-translate-y-0.5 hover:brightness-110"
            >
              Send message
            </button>
            <p className="text-sm text-muted-foreground">
              <span aria-hidden className="text-destructive">
                *
              </span>{" "}
              marks a required field.
            </p>
          </div>

          <p
            role="status"
            aria-live="polite"
            className={`mt-6 flex items-center gap-2 text-sm font-medium text-accent ${sent ? "" : "sr-only"}`}
          >
            {sent && (
              <>
                <CheckCircle2 aria-hidden className="size-5" />
                Thank you — your message has been received. We will be in touch
                soon.
              </>
            )}
          </p>
        </form>

        <div className="space-y-8">
          <div className="rounded-2xl border border-border bg-surface-2 p-7">
            <h3 className="text-lg font-semibold">Reach us directly</h3>
            <ul className="mt-5 space-y-4">
              <li>
                <a
                  href={org.phoneHref}
                  className="flex items-center gap-3 text-muted-foreground transition-colors duration-200 hover:text-foreground"
                >
                  <Phone aria-hidden className="size-5 shrink-0 text-accent" />
                  <span className="font-medium text-foreground">{org.phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={org.emailHref}
                  className="flex items-center gap-3 text-muted-foreground transition-colors duration-200 hover:text-foreground"
                >
                  <Mail aria-hidden className="size-5 shrink-0 text-accent" />
                  <span className="font-medium break-all text-foreground">
                    {org.email}
                  </span>
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
