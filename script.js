const createChat = ({ icon, flow, delayTime, typeSpeed = 18, endTime, onEnd }) => {
  const wrapper = document.querySelector("[chat-wrapper]");

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
  const createOptions = ({ id, options }) => {
    const domOptions = [];
    options.forEach((option, optionIndex) => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      label.classList.add("chat-option");
      label.style.animationDelay = `${optionIndex * 80}ms`;
      input.type = "radio";
      input.name = id;
      input.value = option.value;
      label.innerHTML = `
        <span></span>
        ${option.text}
        `;
      label.appendChild(input);
      domOptions.push([label, input]);
    });
    return domOptions;
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
