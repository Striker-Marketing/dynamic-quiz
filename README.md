# chat3

A tiny, dependency-free chat widget that plays a scripted conversation with typewriter animation, loading dots, clickable radio options, multi-select checkboxes, free-text input, email input, and international phone-number input.

## Files

- `script.js` — defines the global `createChat` function.
- `style.css` — bubble, option, and loading styles. Uses a `[chat-wrapper]` attribute selector.

## Setup

Add a container with the `chat-wrapper` attribute, include the stylesheet and script, then call `createChat`.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/Striker-Marketing/dynamic-quiz@1/style.css" />
<script defer src="https://cdn.jsdelivr.net/gh/Striker-Marketing/dynamic-quiz@1/script.min.js"></script>

<div chat-wrapper></div>

<script>
  document.addEventListener("DOMContentLoaded", () => {
    createChat({
      icon: "https://example.com/avatar.png",
      delayTime: 900,
      typeSpeed: 18,
      endTime: 1500,
      onEnd: () => console.log("conversation finished"),
      flow: [
        {
          question: "Hi! What's your name?",
        },
        {
          id: "plan",
          type: "options",
          question: "Which plan fits you best?",
          options: [
            { value: "free", text: "Free" },
            { value: "pro", text: "Pro" },
          ],
          answers: {
            free: "Great — the Free plan is a solid start.",
            pro: "Nice choice — Pro unlocks everything.",
          },
        },
      ],
    });
  });
</script>
```

## `createChat` options

| Option      | Type     | Description                                                         |
| ----------- | -------- | ------------------------------------------------------------------- |
| `icon`      | string   | URL of the avatar image shown next to bot bubbles.                  |
| `flow`      | array    | Ordered list of steps in the conversation (see below).              |
| `delayTime` | number   | Milliseconds the loading dots are shown before each bot message.    |
| `typeSpeed` | number   | Milliseconds per character for the typewriter effect. Default `18`. |
| `endTime`   | number   | Milliseconds to wait after the last step before firing `onEnd`.     |
| `onEnd`     | function | Callback fired when the flow finishes.                              |
| `lang`      | string   | UI language for built-in strings (errors, buttons): `"en"` or `"pt"`. Defaults to `"pt"` (Portuguese) when unset or unrecognized. |

## Flow item shape

Every item has a `question` string that the bot types out.

**Plain message** — no user input, the flow moves on automatically:

```js
{
  question: "Welcome back!";
}
```

**Options step** — renders radio buttons, waits for a click, then optionally shows an `answers` bubble matched to the selected value:

```js
{
  id: "goal",                                  // radio group name
  type: "options",
  question: "What brings you here today?",
  options: [
    { value: "learn", text: "Learning" },
    { value: "work",  text: "Work" },
  ],
  answers: {                                   // optional
    learn: "Love it — let's learn together.",
    work:  "Perfect — let's get to work.",
  },
}
```

The selected option is echoed back as a user bubble on the right before the answer plays.

**Checkboxes step** — like options, but renders checkboxes for multi-select. The user picks any number of options and taps the confirm button; at least one selection is required, and the chosen labels are echoed (comma-separated) as a user bubble. There is no per-option `answers` map:

```js
{
  id: "topics",
  type: "checkboxes",
  question: "Which topics interest you?",
  options: [
    { value: "js",   text: "JavaScript" },
    { value: "css",  text: "CSS" },
    { value: "html", text: "HTML" },
  ],
}
```

**Text step** — renders a single-line text field with a send button, waits for the user to submit (Enter or the button), then echoes the typed text as a user bubble on the right and moves on:

```js
{
  id: "name",                      // used as the input's `name` (falls back to "answer")
  type: "text",
  question: "What's your name?",
  placeholder: "Type here…",       // optional
}
```

Empty submissions are ignored, so the flow only advances once the user types something.

**Email step** — renders a single-line email field. The address is validated before submit (native browser email validation), and an inline error is shown for invalid/empty input, so the flow only advances once a valid address is entered:

```js
{
  id: "email",
  type: "email",
  question: "What's your email?",
  placeholder: "you@example.com", // optional
}
```

**Tel step** — renders an international phone-number field powered by [intl-tel-input](https://intl-tel-input.com/) (loaded from jsDelivr at runtime). The country is auto-detected from the user's IP (via ipapi.co), the number is validated before submit, and the full E.164 number is echoed as a user bubble:

```js
{
  id: "phone",
  type: "tel",
  question: "What's your phone number?",
  placeholder: "Enter your number", // optional
  fallbackCountry: "us",            // optional (default "us") — used if the IP lookup fails
}
```

Invalid numbers are rejected with an inline message, so the flow only advances once a valid number is entered.

## Notes

- The container is auto-scrolled to the bottom as new content appears.
- Answers may include inline HTML — tags are inserted instantly, only text characters are typed out.
- `style.css` expects a global font to be set on the page (the demo uses Poppins from Google Fonts).
