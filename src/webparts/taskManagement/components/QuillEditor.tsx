// Custom Rich Text Editor is start

import React, { useState, useRef, useEffect } from "react";
import styles from "./QuillEditor.module.scss";
import "./QuillEditor.module.scss";
import { Persona, PersonaSize } from "office-ui-fabric-react";
import {
  EraserFilled,
  TextBoldRegular,
  TextItalicRegular,
  TextUnderline24Regular,
} from "@fluentui/react-icons";
const QuillEditor = ({
  onChange,
  placeHolder,
  defaultValue,
  suggestionList,
  getMentionedEmails,
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef(null);
  const emailPillCounter = useRef(0);
  const [mentionedUsers, setMentionedUsers] = useState([]);
  const [content, setContent] = useState(defaultValue || "");

  useEffect(() => {
    if (suggestions.length > 0) {
      const handleEscapePress = (event) => {
        if (event.key === "Escape") {
          setSuggestions([]);
        }
      };

      document.addEventListener("keydown", handleEscapePress);

      return () => {
        document.removeEventListener("keydown", handleEscapePress);
      };
    }
  }, [suggestions]);

  useEffect(() => {
    // Set the initial content
    if (defaultValue) {
      inputRef.current.innerHTML = defaultValue;
    } else if (defaultValue?.trim() === "") {
      setContent("");
    }
  }, [defaultValue]);

  const generateEmailPillClass = () => {
    const uniqueClass = `emailPill_${emailPillCounter.current}`;
    emailPillCounter.current += 1;
    // Remove spaces from the generated class
    return uniqueClass.replace(/\s+/g, "");
  };

  //stable
  const handleInputChange = (e) => {
    setContent(inputRef.current.innerHTML);
    const fullHtmlContent = inputRef.current.innerHTML;

    const textContent = inputRef.current.innerText;

    // Extract the last word
    const lastWordMatch = fullHtmlContent.match(/@[\w\s]*$/);
    const lastWord = lastWordMatch ? lastWordMatch[0] : "";

    // Check if "@" is present
    if (lastWord.includes("@")) {
      const filteredSuggestions = suggestionList.filter((mention) =>
        mention.name.toLowerCase().includes(lastWord.slice(1).toLowerCase())
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }

    // Check for removed mentions
    const removedMentions = mentionedUsers.filter((mention) => {
      const mentionPattern = `@${mention.name}`;
      return !fullHtmlContent.includes(mentionPattern);
    });

    // Remove the mentions from the array
    setMentionedUsers((prevUsers) => {
      const updatedMentions = prevUsers.filter(
        (mention) =>
          !removedMentions.some((removed) => removed.email === mention.email)
      );

      getMentionedEmails && getMentionedEmails(updatedMentions);
      return updatedMentions;
    });

    // Remove the mentions from the array
    onChange && onChange(fullHtmlContent);
  };

  //stable
  const handleSuggestionClick = (mention) => {
    const selection = saveSelection();
    const text = inputRef.current.innerHTML;
    const innerText = inputRef.current.innerText;

    const lastWordRegex = /(@[\w\s]*)(&nbsp;)?$/;
    const matches = innerText.match(lastWordRegex);

    const emailPillClass = generateEmailPillClass();
    const newEmailPill = document.createElement("span");
    newEmailPill.classList.add(styles.emailPill, emailPillClass);
    newEmailPill.setAttribute("data-emailPill", "true");
    newEmailPill.contentEditable = "false";
    newEmailPill.innerText = `@${mention.name}`;

    if (matches && matches[1]) {
      // Replace the last mention in the text
      const lastMention = matches[1];
      const newText = text.replace(lastWordRegex, newEmailPill.outerHTML);
      inputRef.current.innerHTML = newText + "&nbsp;";
    } else {
      // Insert the new mention at the current caret position
      const range = window.getSelection().getRangeAt(0);
      range.deleteContents();
      range.insertNode(newEmailPill);
    }

    setSuggestions([]);
    restoreSelection(selection);

    // Update your mentioned users state
    const formattedEmail = mention.email;
    setMentionedUsers((prevUsers) => {
      // Check if the mention is already in the list
      if (!prevUsers.some((user) => user.email === formattedEmail)) {
        const mentionedEmailsTemp = [...prevUsers, mention];
        getMentionedEmails && getMentionedEmails(mentionedEmailsTemp);
        return mentionedEmailsTemp;
      }
      return prevUsers;
    });

    setFocusToEnd();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && suggestions.length > 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[0]);
    } else if (e.key === "Backspace") {
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);

      // Use type assertion to inform TypeScript that currentNode is an HTML element
      const currentNode = range.startContainer.parentNode as HTMLElement;

      // Check if the caret is right after an email pill
      if (
        currentNode &&
        currentNode.classList &&
        currentNode.classList.contains(styles.emailPill)
      ) {
        // Remove the entire email pill span
        currentNode.remove();
        e.preventDefault();
      }
    }
  };

  const handleFormat = (format: any) => {
    document.execCommand(format, false, null);
    inputRef.current.focus();
  };

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      return selection.getRangeAt(0).cloneRange();
    }
    return null;
  };

  const restoreSelection = (range) => {
    if (range) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  const setFocusToEnd = () => {
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(inputRef.current);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    inputRef.current.focus();
  };

  return (
    <div className={styles.quillWrapper}>
      <div className={styles.formatButtons}>
        <button onClick={() => handleFormat("bold")}>
          <TextBoldRegular className={styles.button} />
        </button>
        <button onClick={() => handleFormat("italic")}>
          <TextItalicRegular className={styles.button} />
        </button>
        <button onClick={() => handleFormat("underline")}>
          <TextUnderline24Regular className={styles.button} />
        </button>
        <button onClick={() => handleFormat("removeFormat")}>
          <EraserFilled className={styles.button} />
        </button>
      </div>
      <div className={styles.mentionEditorWrapper}>
        <div
          className={styles.mentionEditor}
          ref={inputRef}
          contentEditable
          onInput={handleInputChange}
          onBlur={handleInputChange}
          onKeyDown={handleKeyDown}
          dangerouslySetInnerHTML={{ __html: defaultValue }}
        />
        {content.trim() === "" ? (
          <div
            onClick={() => {
              inputRef.current.focus();
            }}
            className={styles.placeHolder}
          >
            {placeHolder}
          </div>
        ) : (
          ""
        )}
        {suggestions?.length > 0 && (
          <div className={styles.suggestionDropdown}>
            {suggestions?.map((mention) => (
              <div
                key={mention.id}
                className={styles.suggestionItem}
                onClick={(e) => {
                  e.preventDefault();
                  handleSuggestionClick(mention);
                }}
              >
                <Persona
                  title={mention?.id}
                  imageUrl={
                    "/_layouts/15/userphoto.aspx?username=" + mention?.email
                  }
                  size={PersonaSize.size32}
                />{" "}
                <div className={styles.userDetails}>
                  <p>{mention.name}</p>
                  <span>{mention.email}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuillEditor;

// using libs
// import React, { useState, useRef, useEffect } from "react";
// import ContentEditable from "react-contenteditable";
// import MentionHashtag from "mention-hashtag";
// import styles from "./QuillEditor.module.scss";
// import {
//   EraserFilled,
//   TextBoldRegular,
//   TextItalicRegular,
//   TextUnderline24Regular,
// } from "@fluentui/react-icons";
// import { Persona, PersonaSize } from "office-ui-fabric-react";

// const QuillEditor = ({
//   onChange,
//   placeHolder,
//   defaultValue,
//   suggestionList,
//   getMentionedEmails,
// }) => {
//   const [content, setContent] = useState(defaultValue || "");
//   const [suggestions, setSuggestions] = useState([]);
//   const [mentionedUsers, setMentionedUsers] = useState([]); // Add this line
//   const contentEditable = useRef(null);

//   useEffect(() => {
//     if (defaultValue) {
//       setContent(defaultValue);
//     }
//   }, [defaultValue]);

//   const handleInputChange = () => {
//     const currentContent = contentEditable.current.textContent;
//     setContent(currentContent);

//     const textContent = currentContent.trim(); // Get the trimmed text content
//     const words = textContent.split(/\s+/); // Split text content into words
//     const lastWord = words.length > 0 ? words[words.length - 1] : "";

//     if (lastWord.startsWith("@")) {
//       const filteredSuggestions = suggestionList.filter((mention) =>
//         mention.name.toLowerCase().includes(lastWord.slice(1).toLowerCase())
//       );
//       setSuggestions(filteredSuggestions);
//     } else {
//       setSuggestions([]);
//     }

//     // The rest of your code...

//     onChange && onChange(currentContent);
//   };

//   const handleContentChange = (e) => {
//     const value = e.target.value;
//     setContent(value);

//     const mentionHashtag = new MentionHashtag({
//       trigger: "@",
//       data: suggestionList,
//     });

//     setSuggestions(mentionHashtag.getSuggestions(value));
//   };

//   const handleSuggestionClick = (mention) => {
//     const updatedContent = MentionHashtag.insertMention(content, mention, "@");
//     setContent(updatedContent);
//     setSuggestions([]);
//     getMentionedEmails && getMentionedEmails([...mentionedUsers, mention]);
//     contentEditable.current.focus();
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter" && suggestions.length > 0) {
//       e.preventDefault();
//       handleSuggestionClick(suggestions[0]);
//     }
//   };

//   const handleFormat = (format) => {
//     document.execCommand(format, false, null);
//     contentEditable.current.focus();
//   };

//   return (
//     <div className={styles.quillWrapper}>
//       <div className={styles.formatButtons}>
//         <button onClick={() => handleFormat("bold")}>
//           <TextBoldRegular className={styles.button} />
//         </button>
//         <button onClick={() => handleFormat("italic")}>
//           <TextItalicRegular className={styles.button} />
//         </button>
//         <button onClick={() => handleFormat("underline")}>
//           <TextUnderline24Regular className={styles.button} />
//         </button>
//         <button onClick={() => handleFormat("removeFormat")}>
//           <EraserFilled className={styles.button} />
//         </button>
//       </div>
//       <div className={styles.mentionEditorWrapper}>
//         <ContentEditable
//           innerRef={contentEditable}
//           html={content}
//           onInput={handleContentChange}
//           onChange={handleContentChange}
//           tagName="div"
//           onKeyDown={handleKeyDown}
//         />
//         {content.trim() === "" && (
//           <div
//             onClick={() => contentEditable.current.focus()}
//             className={styles.placeHolder}
//           >
//             {placeHolder}
//           </div>
//         )}
//         {suggestions.length > 0 && (
//           <div className={styles.suggestionDropdown}>
//             {suggestions.map((mention) => (
//               <div
//                 key={mention.id}
//                 className={styles.suggestionItem}
//                 onClick={() => handleSuggestionClick(mention)}
//               >
//                 <Persona
//                   title={mention.id}
//                   imageUrl={
//                     "/_layouts/15/userphoto.aspx?username=" + mention.email
//                   }
//                   size={PersonaSize.size32}
//                 />
//                 <div className={styles.userDetails}>
//                   <p>{mention.name}</p>
//                   <span>{mention.email}</span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default QuillEditor;

//quill mention
// under development
// import React, { useState, useRef, useEffect } from "react";
// import Quill from "quill";
// import "quill/dist/quill.snow.css";
// import "quill-mention";
// import "./QuillEditor.module.scss";

// const QuillEditor = ({
//   onChange,
//   placeHolder,
//   defaultValue,
//   suggestionList,
//   getMentionedEmails,
// }) => {
//   const [suggestions, setSuggestions] = useState([]);
//   const [mentionedUsers, setMentionedUsers] = useState([]);
//   const [content, setContent] = useState(defaultValue || "");
//   const quillRef = useRef(null);
//   let suggestionItems = suggestionList?.map((e) => {
//     return {
//       id: e?.id,
//       value: e?.name,
//       email: e?.email,
//     };
//   });
//   async function suggestPeople(searchTerm) {
//     // const allPeople = [
//     //   {
//     //     id: 1,
//     //     value: "Fredrik Sundqvist",
//     //     email: "fre@fre.com",
//     //   },
//     //   {
//     //     id: 2,
//     //     value: "Patrik Sjölin",
//     //     email: "abc@erf.com",
//     //   },
//     // ];
//     return suggestionItems.filter((person) =>
//       person.value?.toLowerCase().includes(searchTerm?.toLowerCase())
//     );
//   }

//   console.log("suugg", suggestionItems);

//   console.log("content", content);
//   function getMentionValues(className: string): any[] {
//     const mentionElements = document.getElementsByClassName(className);
//     const mentionValues = Array.from(mentionElements).map((e) =>
//       e?.getAttribute("data-value")
//     );
//     return mentionValues;
//   }

//   function filterPeopleByMentions(
//     allPeople: any[],
//     mentionValues: any[]
//   ): string[] {
//     const filteredPeople = allPeople?.filter((el) =>
//       mentionValues?.includes(el?.value)
//     );
//     const uniqueEmails = Array.from(
//       new Set(filteredPeople?.map((e) => e?.email))
//     );
//     return uniqueEmails;
//   }

//   // Example usage:

//   const mentionValues = getMentionValues("mention");
//   console.log("mentionValues", mentionValues);

//   const uniqueEmails = filterPeopleByMentions(suggestionItems, mentionValues);
//   console.log("uniqueEmails", uniqueEmails);

//   useEffect(() => {
//     onChange(content);
//   }, [content]);

//   useEffect(() => {
//     // Initialize Quill with the mention module
//     const quill = new Quill("#quill-editor", {
//       theme: "snow", // or use another theme
//       modules: {
//         toolbar: [
//           ["bold", "italic", "underline"],
//           // Add other toolbar options as needed
//         ],
//         mention: {
//           allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
//           mentionDenotationChars: ["@"],
//           source: async function (searchTerm, renderList, mentionsChar) {
//             const matchedPeople = await suggestPeople(searchTerm);
//             renderList(matchedPeople, searchTerm);
//             console.log("matchedPeople", matchedPeople);
//           },
//         },
//       },
//     });

//     quill.on("text-change", (delta, oldDelta, source) => {
//       // Handle text changes here
//       const quillContent = quill.root.innerHTML;
//       onChange && onChange(quillContent);
//       setContent(quillContent);
//       console.log("content1", content);
//     });

//     quillRef.current = quill;
//     content && console.log(document.getElementsByClassName("mention"));

//     // Cleanup function to destroy the Quill instance when the component unmounts
//     return () => {
//       const quillInstance = quillRef.current;
//       if (quillInstance) {
//         quillInstance.root.innerHTML = "";
//       }
//     };
//   }, []);

//   return (
//     <div className="quill-editor-wrapper">
//       <div id="quill-editor" className="quill-editor" />
//     </div>
//   );
// };

// export default QuillEditor;

//quil mention ends

// new one

// const properties = [
//   "direction",
//   "boxSizing",
//   "width",
//   "height",
//   "overflowX",
//   "overflowY",
//   "borderTopWidth",
//   "borderRightWidth",
//   "borderBottomWidth",
//   "borderLeftWidth",
//   "borderStyle",
//   "paddingTop",
//   "paddingRight",
//   "paddingBottom",
//   "paddingLeft",
//   "fontStyle",
//   "fontVariant",
//   "fontWeight",
//   "fontStretch",
//   "fontSize",
//   "fontSizeAdjust",
//   "lineHeight",
//   "fontFamily",
//   "textAlign",
//   "textTransform",
//   "textIndent",
//   "textDecoration",
//   "letterSpacing",
//   "wordSpacing",
//   "tabSize",
//   "MozTabSize",
// ];

// const isFirefox =
//   typeof window !== "undefined" && window["mozInnerScreenX"] != null;

// /**
//  * @param {HTMLDivElement} element
//  * @param {number} position
//  */
// function getCaretCoordinates(element, position) {
//   const div = document.createElement("div");
//   document.body.appendChild(div);

//   const style = div.style;
//   const computed = getComputedStyle(element);

//   style.whiteSpace = "pre-wrap";
//   style.wordWrap = "break-word";
//   style.position = "absolute";
//   style.visibility = "hidden";

//   properties.forEach((prop) => {
//     style[prop] = computed[prop];
//   });

//   style.overflow = "hidden";

//   const content = element.innerHTML.replace(/<br>/g, "\n"); // Convert <br> to line break
//   div.innerHTML = content.substring(0, position);

//   const span = document.createElement("span");
//   span.innerHTML = content.substring(position) || ".";
//   div.appendChild(span);

//   const coordinates = {
//     top: span.offsetTop + parseInt(computed["borderTopWidth"]),
//     left: span.offsetLeft + parseInt(computed["borderLeftWidth"]),
//     height: span.offsetHeight,
//   };

//   div.remove();

//   return coordinates;
// }

// const QuillMention = ({ placeholder, suggestionList }) => {
//   const editorRef = useRef(null);
//   const menuRef = useRef(null);
//   const [options, setOptions] = useState([]);
//   const [active, setActive] = useState(0);
//   const [triggerIdx, setTriggerIdx] = useState(null);

//   useEffect(() => {
//     const handleDocumentClick = (event) => {
//       if (menuRef.current && !menuRef.current.contains(event.target)) {
//         setOptions([]);
//       }
//     };

//     document.addEventListener("click", handleDocumentClick);

//     return () => {
//       document.removeEventListener("click", handleDocumentClick);
//     };
//   }, []);

//   const makeOptions = async (query) => {
//     const filteredSuggestions = suggestionList.filter((mention) =>
//       mention.name.toLowerCase().includes(query.toLowerCase())
//     );

//     setOptions(filteredSuggestions);
//   };

//   const closeMenu = () => {
//     setOptions([]);
//     setTriggerIdx(null);
//   };

//   const emailPillCounter = useRef(0);

//   const generateEmailPillClass = () => {
//     const uniqueClass = `emailPill_${emailPillCounter.current}`;
//     emailPillCounter.current += 1;
//     return uniqueClass.replace(/\s+/g, "");
//   };

//   const selectItem = (index) => {
//     const preMention = editorRef.current.innerText.substring(0, triggerIdx);
//     const option = options[index];
//     const emailPillClass = generateEmailPillClass();
//     const mention = (
//       <span
//         className={`${emailPillClass}`}
//         contentEditable="false"
//       >{`@${option.name}`}</span>
//     );
//     const postMention = editorRef.current.innerText.substring(triggerIdx);
//     editorRef.current.innerHTML = "";
//     editorRef.current.appendChild(document.createTextNode(preMention));
//     editorRef.current.appendChild(mention);
//     editorRef.current.appendChild(document.createTextNode(postMention));

//     closeMenu();
//     setFocusToEnd();
//   };

//   const setFocusToEnd = () => {
//     const range = document.createRange();
//     const selection = window.getSelection();
//     range.selectNodeContents(editorRef.current);
//     range.collapse(false);
//     selection.removeAllRanges();
//     selection.addRange(range);
//     editorRef.current.focus();
//   };

//   const onInput = () => {
//     const positionIndex = window.getSelection().focusOffset;
//     const textBeforeCaret = editorRef.current.innerText.slice(0, positionIndex);
//     const tokens = textBeforeCaret.split(/\s/);
//     const lastToken = tokens[tokens.length - 1];
//     const triggerIdx = textBeforeCaret.endsWith(lastToken)
//       ? textBeforeCaret.length - lastToken.length
//       : -1;
//     const maybeTrigger = textBeforeCaret[triggerIdx];
//     const keystrokeTriggered = maybeTrigger === "@";

//     if (!keystrokeTriggered) {
//       closeMenu();
//       return;
//     }

//     const query = textBeforeCaret.slice(triggerIdx + 1);
//     makeOptions(query);

//     setTriggerIdx(triggerIdx);
//     setActive(0);
//     renderMenu();
//   };

//   const onKeyDown = (ev) => {
//     if (triggerIdx !== null) {
//       switch (ev.key) {
//         case "ArrowDown":
//           setActive((prev) => Math.min(prev + 1, options.length - 1));
//           ev.preventDefault();
//           break;
//         case "ArrowUp":
//           setActive((prev) => Math.max(prev - 1, 0));
//           ev.preventDefault();
//           break;
//         case "Enter":
//         case "Tab":
//           selectItem(active);
//           ev.preventDefault();
//           break;
//       }
//     }
//   };

//   const renderMenu = () => {
//     if (options.length === 0) {
//       menuRef.current.hidden = true;
//       return;
//     }

//     menuRef.current.innerHTML = "";

//     options.forEach((option, idx) => {
//       menuRef.current.appendChild(menuItemFn(option, idx, idx === active));
//     });

//     menuRef.current.hidden = false;
//   };

//   const menuItemFn = (option, idx, selected) => {
//     const div = document.createElement("div");
//     div.setAttribute("role", "option");
//     div.className = `menu-item ${selected ? "selected" : ""}`;
//     div.textContent = option.name;
//     div.onclick = () => selectItem(idx);
//     return div;
//   };

//   return (
//     <div>
//       <div
//         ref={editorRef}
//         contentEditable="true"
//         placeholder={placeholder}
//         onInput={onInput}
//         onKeyDown={onKeyDown}
//       ></div>
//       <div ref={menuRef} className="menu" role="listbox"></div>
//     </div>
//   );
// };

// export default QuillMention;

// export default QuillMention;

// new one ends

// Custom Rich Text Editor is Over

// Prime react mention

// import React, { useState, useEffect } from "react";
// import { Mention } from "primereact/mention";

// const MentionDemo = () => {
//   const [customers, setCustomers] = useState([]);
//   const [suggestions, setSuggestions] = useState([]);
//   const [multipleSuggestions, setMultipleSuggestions] = useState([]);

//   const tagSuggestions = ["primereact", "primefaces", "primeng", "primevue"];

//   useEffect(() => {
//     // Mocking asynchronous data fetching
//     const mockData = [
//       { id: 1, nickname: "John Doe", email: "john.doe@example.com" },
//       {
//         key: 2,
//         id: 2,
//         nickname: "Jane Smith",
//         email: "jane.smith@example.com",
//       },
//     ];

//     mockData.forEach(
//       (d) =>
//         (d["nickname"] = `${d.nickname.replace(/\s+/g, "").toLowerCase()}_${
//           d.id
//         }`)
//     );
//     setCustomers(mockData);
//   }, []);

//   const onSearch = (event) => {
//     setTimeout(() => {
//       const query = event.query;
//       let tempSuggestions;

//       if (!query.trim().length) {
//         tempSuggestions = [...customers];
//       } else {
//         tempSuggestions = customers.filter((customer) =>
//           customer.nickname.toLowerCase().startsWith(query.toLowerCase())
//         );
//       }

//       setSuggestions(tempSuggestions);
//     }, 250);
//   };

//   const onMultipleSearch = (event) => {
//     const trigger = event.trigger;

//     if (trigger === "@") {
//       setTimeout(() => {
//         const query = event.query;
//         let tempMultipleSuggestions;

//         if (!query.trim().length) {
//           tempMultipleSuggestions = [...customers];
//         } else {
//           tempMultipleSuggestions = customers.filter((customer) =>
//             customer.nickname.toLowerCase().startsWith(query.toLowerCase())
//           );
//         }

//         setMultipleSuggestions(tempMultipleSuggestions);
//       }, 250);
//     } else if (trigger === "#") {
//       setTimeout(() => {
//         const query = event.query;
//         let tempMultipleSuggestions;

//         if (!query.trim().length) {
//           tempMultipleSuggestions = [...tagSuggestions];
//         } else {
//           tempMultipleSuggestions = tagSuggestions.filter((tag) =>
//             tag.toLowerCase().startsWith(query.toLowerCase())
//           );
//         }

//         setMultipleSuggestions(tempMultipleSuggestions);
//       }, 250);
//     }
//   };

//   const itemTemplate = (suggestion) => {
//     const src = "images/avatar/" + suggestion.representative?.image;

//     return (
//       <div className="flex align-items-center">
//         {/* <img
//           alt={suggestion.name}
//           src={src}
//           onError={(e) =>
//             (e.target.src =
//               "https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png")
//           }
//           width="32"
//           style={{ verticalAlign: "middle" }}
//         /> */}
//         <span className="flex flex-column ml-2">
//           {suggestion.name}
//           <small
//             style={{ fontSize: ".75rem", color: "var(--text-secondary-color)" }}
//           >
//             @{suggestion.nickname}
//           </small>
//         </span>
//       </div>
//     );
//   };

//   const multipleItemTemplate = (suggestion, options) => {
//     const trigger = options.trigger;

//     if (trigger === "@" && suggestion.nickname) {
//       return itemTemplate(suggestion);
//     } else if (trigger === "#" && !suggestion.nickname) {
//       return <span>{suggestion}</span>;
//     }

//     return null;
//   };

//   return (
//     <div className="card">
//       <h5>Basic</h5>
//       <Mention
//         suggestions={suggestions}
//         onSearch={onSearch}
//         field="nickname"
//         placeholder="Please enter @ to mention people"
//         rows={5}
//         cols={40}
//         itemTemplate={itemTemplate}
//       />

//       {/* <h5>Auto Resize</h5>
//       <Mention
//         suggestions={suggestions}
//         onSearch={onSearch}
//         field="nickname"
//         placeholder="Please enter @ to mention people"
//         rows={5}
//         cols={40}
//         autoResize
//         itemTemplate={itemTemplate}
//       />

//       <h5>Multiple Trigger</h5>
//       <Mention
//         trigger={["@", "#"]}
//         suggestions={multipleSuggestions}
//         onSearch={onMultipleSearch}
//         field={["nickname"]}
//         placeholder="Please enter @ to mention people, # to mention tag"
//         itemTemplate={multipleItemTemplate}
//         rows={5}
//         cols={40}
//       /> */}
//     </div>
//   );
// };

// export default MentionDemo;

// react mention

// import React, { useState } from "react";
// import Mentions from "react-mentions";

// const QuillEditor = () => {
//   const [value, setValue] = useState("");
//   const [mentions, setMentions] = useState([]);

//   const suggestions = [
//     { id: 1, display: "John Doe", email: "john.doe@example.com" },
//     { id: 2, display: "Jane Smith", email: "jane.smith@example.com" },
//   ];

//   const handleInputChange = (ev, newValue, newPlainTextValue, mentions) => {
//     setValue(newPlainTextValue);
//     setMentions(mentions);
//   };

//   const renderSuggestion = (suggestion, search, highlightedDisplay) => (
//     <div className="user">{highlightedDisplay}</div>
//   );

//   return (
//     <Mentions
//       value={value}
//       onChange={handleInputChange}
//       style={{ width: "100%", border: "1px solid #ccc", padding: "10px" }}
//       markup="@[__display__](__type__:__id__)"
//       displayTransform={(id, display, type) => `@${display}`}
//       suggestions={suggestions}
//       renderSuggestion={renderSuggestion}
//       onAdd={(id, display, type) =>
//         console.log("User added:", id, display, type)
//       }
//       // singleLine
//     />
//   );
// };

// export default QuillEditor;

// quill mention
/* eslint-disable react-hooks/exhaustive-deps */

// import ReactQuill from "react-quill";
// import React, { useEffect, useRef } from "react";
// import "quill-mention";

// import "react-quill/dist/quill.snow.css"; // Add css for snow theme
// // import '../scss/modules/_editor.scss';

// const atValues = [
//   { id: 1, value: "Fredrik Sundqvist" },
//   { id: 2, value: "Patrik Sjölin" },
// ];
// const hashValues = [
//   { id: 3, value: "Fredrik Sundqvist 2" },
//   { id: 4, value: "Patrik Sjölin 2" },
// ];

// export default function QuillEditor({
//   onChange,
//   defaultValue,
//   placeholder,
//   className,
//   theme,
// }: {
//   onChange?: (value: { html: string; delta: any }) => void;
//   defaultValue?: string;
//   theme?: string;
//   placeholder?: string;
//   className?: string;
// }): JSX.Element {
//   const editor = useRef<any>();

//   const modules = {
//     toolbar: [["bold", "italic", "underline"], ["clean"]],
//     mention: {
//       allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
//       mentionDenotationChars: ["@", "#"],
//       source: function (searchTerm: any, renderList: any, mentionChar: any) {
//         let values;

//         if (mentionChar === "@") {
//           values = atValues;
//         } else {
//           values = hashValues;
//         }

//         if (searchTerm.length === 0) {
//           renderList(values, searchTerm);
//         } else {
//           const matches = [];
//           for (let i = 0; i < values.length; i++)
//             if (
//               ~values[i].value.toLowerCase().indexOf(searchTerm.toLowerCase())
//             )
//               matches.push(values[i]);
//           renderList(matches, searchTerm);
//         }
//       },
//     },
//   };

//   useEffect(() => {
//     if (defaultValue) {
//       const delta = editor.current.editor.clipboard.convert(defaultValue);
//       editor.current.editor.setContents(delta, "silent");
//     }
//   }, [defaultValue]);

//   return (
//     // <div className={`w-100 h-full ${className}`}>
//     <ReactQuill
//       ref={editor}
//       theme={theme}
//       modules={{ ...modules }}
//       onKeyUp={(e) => {
//         console.log(e, editor);
//         if (editor.current.editor) {
//           const delta = editor.current.editor.getContents();
//           const html = editor.current.editor.root.innerHTML;
//           // onChange({ delta, html });
//           console.log({ delta, html });
//         }
//       }}
//       placeholder={placeholder}
//     />
//     // </div>
//   );
// }
