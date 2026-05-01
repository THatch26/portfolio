import { useState, useCallback } from 'react';
import { submitContact } from '../lib/api';
import styles from './Contact.module.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateField(name, value) {
  if (!value || !value.trim()) return 'This field is required';

  if (name === 'email' && !EMAIL_REGEX.test(value)) {
    return 'Please enter a valid email address';
  }

  if (name === 'message' && value.length > 2000) {
    return 'Message must be 2000 characters or fewer';
  }

  return '';
}

function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  }, [touched]);

  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      const newErrors = {};
      for (const field of ['name', 'email', 'subject', 'message']) {
        newErrors[field] = validateField(field, form[field]);
      }
      setErrors(newErrors);
      setTouched({ name: true, email: true, subject: true, message: true });

      const hasErrors = Object.values(newErrors).some(Boolean);
      if (hasErrors) return;

      setSubmitting(true);
      setSubmitError(null);

      const result = await submitContact(form);

      if (result === null) {
        setSubmitError('Failed to send message. Please try again.');
        setSubmitting(false);
        return;
      }

      setSuccess(result);
      setSubmitting(false);
      setForm({ name: '', email: '', subject: '', message: '' });
      setTouched({});
      setErrors({});
    },
    [form]
  );

  if (success) {
    return (
      <div className={styles.wrapper}>
        <h2 className={styles.heading}>Contact</h2>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>&#10003;</div>
          <h3 className={styles.successTitle}>Message received!</h3>
          <p className={styles.successRef}>
            Reference: #{success.id || success.reference || 'N/A'}
          </p>
        </div>
      </div>
    );
  }

  const charCount = form.message.length;

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}>Contact</h2>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label htmlFor="contact-name" className={styles.label}>
            Name
          </label>
          <input
            id="contact-name"
            className={`${styles.input} ${errors.name && touched.name ? styles.inputError : ''}`}
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Your name"
            autoComplete="name"
          />
          {errors.name && touched.name && (
            <span className={styles.errorMsg} role="alert">{errors.name}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="contact-email" className={styles.label}>
            Email
          </label>
          <input
            id="contact-email"
            className={`${styles.input} ${errors.email && touched.email ? styles.inputError : ''}`}
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="you@example.com"
            autoComplete="email"
          />
          {errors.email && touched.email && (
            <span className={styles.errorMsg} role="alert">{errors.email}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="contact-subject" className={styles.label}>
            Subject
          </label>
          <input
            id="contact-subject"
            className={`${styles.input} ${errors.subject && touched.subject ? styles.inputError : ''}`}
            type="text"
            name="subject"
            value={form.subject}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="What's this about?"
          />
          {errors.subject && touched.subject && (
            <span className={styles.errorMsg} role="alert">{errors.subject}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="contact-message" className={styles.label}>
            Message
          </label>
          <textarea
            id="contact-message"
            className={`${styles.textarea} ${errors.message && touched.message ? styles.inputError : ''}`}
            name="message"
            value={form.message}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Your message..."
            rows={5}
            maxLength={2000}
          />
          <div className={styles.textareaFooter}>
            {errors.message && touched.message && (
              <span className={styles.errorMsg} role="alert">{errors.message}</span>
            )}
            <span className={`${styles.charCount} ${charCount > 1800 ? styles.charCountWarn : ''}`}>
              {charCount} / 2000
            </span>
          </div>
        </div>

        {submitError && (
          <div className={styles.submitError} role="alert">
            {submitError}
          </div>
        )}

        <button
          className={styles.submitBtn}
          type="submit"
          disabled={submitting}
        >
          {submitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}

export default Contact;
