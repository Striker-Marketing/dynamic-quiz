# chat3

A tiny, dependency-free chat widget that plays a scripted conversation with typewriter animation, loading dots, and clickable radio options.

## Files

- `script.js` — defines the global `createChat` function.
- `style.css` — bubble, option, and loading styles. Uses a `[chat-wrapper]` attribute selector.

## Setup

Add a container with the `chat-wrapper` attribute, include the stylesheet and script, then call `createChat`.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/Striker-Marketing/dynamic-quiz@1/style.min.css" />
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

## Notes

- The container is auto-scrolled to the bottom as new content appears.
- Answers may include inline HTML — tags are inserted instantly, only text characters are typed out.
- `style.css` expects a global font to be set on the page (the demo uses Poppins from Google Fonts).
