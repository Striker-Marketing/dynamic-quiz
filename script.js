const createChat = ({ icon, flow, delayTime, typeSpeed = 18, endTime, onEnd, lang }) => {
  const wrapper = document.querySelector("[chat-wrapper]");

  const TRANSLATIONS = {
    en: {
      send: "Send",
      confirm: "Confirm",
      invalidEmail: "Please enter a valid email address.",
      invalidPhone: "Please enter a valid phone number.",
      selectAtLeastOne: "Please select at least one option.",
      genericError: "Something went wrong. Please try again.",
    },
    pt: {
      send: "Enviar",
      confirm: "Confirmar",
      invalidEmail: "Por favor, insira um e-mail válido.",
      invalidPhone: "Por favor, insira um número de telefone válido.",
      selectAtLeastOne: "Por favor, selecione pelo menos uma opção.",
      genericError: "Algo deu errado. Por favor, tente novamente.",
    },
  };
  // Fallback to Portuguese for an unset or unrecognized language.
  const t = TRANSLATIONS[lang] || TRANSLATIONS.pt;

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };
  const wrapperObserver = new MutationObserver(scrollToBottom);
  wrapperObserver.observe(wrapper, {
    childList: true,
    subtree: true,
    characterData: true,
  });
  const loadingSvg =
    '<svg class="chat-loading" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><style>.spinner_qM83{animation:spinner_8HQG 1.05s infinite}.spinner_oXPr{animation-delay:.1s}.spinner_ZTLf{animation-delay:.2s}@keyframes spinner_8HQG{0%,57.14%{animation-timing-function:cubic-bezier(0.33,.66,.66,1);transform:translate(0)}28.57%{animation-timing-function:cubic-bezier(0.33,0,.66,.33);transform:translateY(-6px)}100%{transform:translate(0)}}</style><circle class="spinner_qM83" cx="4" cy="12" r="3"/><circle class="spinner_qM83 spinner_oXPr" cx="12" cy="12" r="3"/><circle class="spinner_qM83 spinner_ZTLf" cx="20" cy="12" r="3"/></svg>';
  const sendSvg =
    '<svg class="chat-send-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" aria-hidden="true"><path fill="currentColor" d="M568.4 37.7C578.2 34.2 589 36.7 596.4 44C603.8 51.3 606.2 62.2 602.7 72L424.7 568.9C419.7 582.8 406.6 592 391.9 592C377.7 592 364.9 583.4 359.6 570.3L295.4 412.3C290.9 401.3 292.9 388.7 300.6 379.7L395.1 267.3C400.2 261.2 399.8 252.3 394.2 246.7C388.6 241.1 379.6 240.7 373.6 245.8L261.2 340.1C252.1 347.7 239.6 349.7 228.6 345.3L70.1 280.8C57 275.5 48.4 262.7 48.4 248.5C48.4 233.8 57.6 220.7 71.5 215.7L568.4 37.7z"/></svg>';
  const checkSvg =
    '<svg class="chat-check" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const ITI_VERSION = "29.5.3";
  let itiLoader;
  const loadIntlTelInput = () => {
    if (itiLoader) return itiLoader;
    itiLoader = new Promise((resolve, reject) => {
      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = `https://cdn.jsdelivr.net/npm/intl-tel-input@${ITI_VERSION}/dist/css/intlTelInput.css`;
      document.head.appendChild(css);
      const script = document.createElement("script");
      script.src = `https://cdn.jsdelivr.net/npm/intl-tel-input@${ITI_VERSION}/dist/js/intlTelInput.min.js`;
      script.onload = () => resolve(window.intlTelInput);
      script.onerror = () => reject(new Error("Failed to load intl-tel-input"));
      document.head.appendChild(script);
    });
    return itiLoader;
  };

  const delay = () =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, delayTime);
    });

  const typewriter = async (element, html) => {
    element.innerHTML = "";
    let renderedHtml = "";
    let insideTag = false;
    for (const character of html) {
      renderedHtml += character;
      if (character === "<") insideTag = true;
      if (character === ">") {
        insideTag = false;
        element.innerHTML = renderedHtml;
        continue;
      }
      if (insideTag) continue;
      element.innerHTML = renderedHtml;
      await new Promise((resolve) => setTimeout(resolve, typeSpeed));
    }
  };

  const typeBubble = async (bubbleWrapper, html) => {
    const paragraph = bubbleWrapper.querySelector("p");
    if (!paragraph) return;
    bubbleWrapper.classList.add("is-typing");
    await typewriter(paragraph, html);
    bubbleWrapper.classList.remove("is-typing");
  };

  const createQuestionWrapper = () => {
    const wrapper = document.createElement("div");
    wrapper.classList.add("chat-question-wrapper");
    return wrapper;
  };

  const createText = ({ svg, text, isAnswer }) => {
    const wrapper = document.createElement("div");
    wrapper.classList.add("chat-question");
    if (isAnswer) {
      wrapper.classList.add("chat-answer");
    }
    wrapper.innerHTML = `<img src="${icon}">
        ${svg || `<p>${text}</p>`}`;
    return wrapper;
  };
  const createOptions = ({ id, options, multiple }) => {
    const domOptions = [];
    options.forEach((option, optionIndex) => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      label.classList.add("chat-option");
      if (multiple) label.classList.add("chat-option-multi");
      label.style.animationDelay = `${optionIndex * 80}ms`;
      input.type = multiple ? "checkbox" : "radio";
      input.name = id;
      input.value = option.value;
      label.innerHTML = `
        <span>${multiple ? checkSvg : ""}</span>
        ${option.text}
        `;
      label.appendChild(input);
      domOptions.push([label, input]);
    });
    return domOptions;
  };

  const createTextInput = ({ id, type = "text", placeholder, fallbackName = "answer" }) => {
    const form = document.createElement("form");
    form.classList.add("chat-text");
    const row = document.createElement("div");
    row.classList.add("chat-input-row");
    const input = document.createElement("input");
    input.classList.add("chat-field");
    input.type = type;
    input.name = id || fallbackName;
    input.autocomplete = type === "email" ? "email" : "off";
    if (placeholder) input.placeholder = placeholder;
    const button = document.createElement("button");
    button.classList.add("chat-send");
    button.type = "button";
    button.setAttribute("aria-label", t.send);
    button.innerHTML = sendSvg;
    const error = document.createElement("p");
    error.classList.add("chat-error");
    row.appendChild(input);
    row.appendChild(button);
    form.appendChild(row);
    form.appendChild(error);
    return [form, input, button, error];
  };

  // Resolves with the trimmed value once `validate` passes. Triggered by the send
  // button and the Enter key, so no native form submission (and no native
  // constraint-validation popups) ever runs — our validator is the only gate.
  // validate(value) -> true (valid), a string (invalid, shown as the error), or
  // false (invalid, no message).
  const awaitFieldValue = ({ input, button, error, validate }) =>
    new Promise((resolve) => {
      const submit = () => {
        const value = input.value.trim();
        const result = validate(value);
        if (result === true) {
          if (error) error.textContent = "";
          resolve(value);
          return;
        }
        if (error) error.textContent = typeof result === "string" ? result : "";
      };
      button.addEventListener("click", submit);
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          submit();
        }
      });
    });

  const createTelInput = ({ id, placeholder }) => {
    const form = document.createElement("form");
    form.classList.add("chat-text");
    const row = document.createElement("div");
    row.classList.add("chat-input-row");
    const input = document.createElement("input");
    input.classList.add("chat-field");
    input.type = "tel";
    input.name = id || "phone";
    input.autocomplete = "tel";
    if (placeholder) input.placeholder = placeholder;
    const button = document.createElement("button");
    button.classList.add("chat-send");
    button.type = "submit";
    button.setAttribute("aria-label", t.send);
    button.innerHTML = sendSvg;
    const error = document.createElement("p");
    error.classList.add("chat-error");
    row.appendChild(input);
    row.appendChild(button);
    form.appendChild(row);
    form.appendChild(error);
    return [form, input, button, error];
  };

  const addLoading = async (wrapper) => {
    const loading = createText({ svg: loadingSvg });
    wrapper.appendChild(loading);
    await delay();
    loading.remove();
    return;
  };

  const recursiveFlow = async ({ items, index }) => {
    await addLoading(wrapper);
    const item = items[index];
    const questionWrapper = createQuestionWrapper();
    wrapper.appendChild(questionWrapper);
    const questionBubble = createText({ text: item.question });
    questionWrapper.appendChild(questionBubble);
    await typeBubble(questionBubble, item.question);
    if (item.type === "options") {
      const options = createOptions({ id: item.id, options: item.options });
      const selectedInput = await new Promise((resolve) => {
        options.forEach(([label, input]) => {
          questionWrapper.appendChild(label);
          input.addEventListener("change", () => {
            resolve(input);
          });
        });
      });
      options.forEach(([, input]) => {
        input.setAttribute("disabled", "disabled");
      });
      if (item.answers) {
        wrapper.appendChild(createText({ text: selectedInput.parentElement.innerText, isAnswer: true }));
        await addLoading(wrapper);
        const answerText = item.answers[selectedInput.value];
        const answerBubble = createText({ text: answerText });
        wrapper.appendChild(answerBubble);
        await typeBubble(answerBubble, answerText);
      }
    }
    if (item.type === "checkboxes") {
      const options = createOptions({
        id: item.id,
        options: item.options,
        multiple: true,
      });
      options.forEach(([label]) => questionWrapper.appendChild(label));

      const actions = document.createElement("div");
      actions.classList.add("chat-text");
      const button = document.createElement("button");
      button.classList.add("chat-confirm");
      button.type = "button";
      button.innerHTML = `<span>${t.confirm}</span>${checkSvg}`;
      const error = document.createElement("p");
      error.classList.add("chat-error");
      actions.appendChild(button);
      actions.appendChild(error);
      questionWrapper.appendChild(actions);

      const selected = await new Promise((resolve) => {
        button.addEventListener("click", () => {
          const checked = options.filter(([, input]) => input.checked);
          if (!checked.length) {
            error.textContent = t.selectAtLeastOne;
            return;
          }
          error.textContent = "";
          resolve(checked);
        });
      });
      options.forEach(([, input]) => input.setAttribute("disabled", "disabled"));
      button.setAttribute("disabled", "disabled");
      const text = selected.map(([label]) => label.innerText.trim()).join(", ");
      wrapper.appendChild(createText({ text, isAnswer: true }));
    }
    if (item.type === "text") {
      const [form, input, button] = createTextInput({
        id: item.id,
        placeholder: item.placeholder,
      });
      questionWrapper.appendChild(form);
      input.focus();
      const value = await awaitFieldValue({
        input,
        button,
        validate: (v) => v.length > 0,
      });
      input.setAttribute("disabled", "disabled");
      button.setAttribute("disabled", "disabled");
      wrapper.appendChild(createText({ text: value, isAnswer: true }));
    }
    if (item.type === "email") {
      const [form, input, button, error] = createTextInput({
        id: item.id,
        type: "email",
        placeholder: item.placeholder,
        fallbackName: "email",
      });
      questionWrapper.appendChild(form);
      input.focus();
      const value = await awaitFieldValue({
        input,
        button,
        error,
        validate: (v) =>
          EMAIL_REGEX.test(v) ? true : t.invalidEmail,
      });
      input.setAttribute("disabled", "disabled");
      button.setAttribute("disabled", "disabled");
      wrapper.appendChild(createText({ text: value, isAnswer: true }));
    }
    if (item.type === "tel") {
      await loadIntlTelInput();
      const [form, input, button, error] = createTelInput({
        id: item.id,
        placeholder: item.placeholder,
      });
      questionWrapper.appendChild(form);
      const fallbackCountry = (item.fallbackCountry || "us").toLowerCase();
      const iti = window.intlTelInput(input, {
        initialCountryLookup: async () => {
          try {
            const res = await fetch("https://ipapi.co/json");
            const data = await res.json();
            return data.country_code || fallbackCountry;
          } catch {
            return fallbackCountry;
          }
        },
        loadUtils: () =>
          import(`https://cdn.jsdelivr.net/npm/intl-tel-input@${ITI_VERSION}/dist/js/utils.js`),
      });
      input.focus();
      await iti.promise;
      const value = await new Promise((resolve) => {
        form.addEventListener("submit", (event) => {
          event.preventDefault();
          if (!input.value.trim() || !iti.isValidNumber()) {
            error.textContent = t.invalidPhone;
            return;
          }
          error.textContent = "";
          resolve(iti.getNumber());
        });
      });
      input.setAttribute("disabled", "disabled");
      button.setAttribute("disabled", "disabled");
      wrapper.appendChild(createText({ text: value, isAnswer: true }));
    }
    if (item.sendExternal) {
      const loading = createText({ svg: loadingSvg });
      wrapper.appendChild(loading);
      let valid = false;
      try {
        valid = Boolean(await item.sendExternal());
      } catch {
        valid = false;
      }
      loading.remove();
      if (!valid) {
        const errorText = item.errorMessage || t.genericError;
        const errorBubble = createText({ text: errorText });
        wrapper.appendChild(errorBubble);
        await typeBubble(errorBubble, errorText);
        return;
      }
    }
    if (!items[index + 1]) {
      setTimeout(() => {
        onEnd();
      }, endTime);
      return;
    }
    return recursiveFlow({ items, index: index + 1 });
  };

  recursiveFlow({ items: flow, index: 0 });
};
