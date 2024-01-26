import React from "react";
import { Persona, PersonaSize } from "office-ui-fabric-react/lib/Persona";
import styles from "./MyTasks.module.scss";
import moment from "moment";

const ChatBox = ({ e, loginUserData }) => {
  const isMyMessage = loginUserData?.ID === e?.Author.Id;
  console.log(loginUserData?.ID, e?.Author.Id);

  console.log("isMyMessage", isMyMessage);

  // working
  const convertURLsToLinks = (text) => {
    const linkRegex =
      /(?:https?&#\d+;\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[^\s<>]*)?/g;

    const replacedText = text.replace(linkRegex, (match) => {
      const url = match.startsWith("http")
        ? match
        : `https://${match.replace(/&\#\d+;/g, ":")}`;
      return `<a href="${url}" target="_blank">${match}</a>`;
    });

    return replacedText;
  };

  return (
    <div className={isMyMessage ? styles.myMsgStyle : styles.othersMsgStyle}>
      {!isMyMessage && (
        <Persona
          className={styles.userAvatar}
          title={e?.Author?.Title || loginUserData?.Title}
          imageUrl={
            e?.Author?.EMail
              ? "/_layouts/15/userphoto.aspx?username=" + e?.Author?.EMail
              : "/_layouts/15/userphoto.aspx?username=" + loginUserData?.EMail
          }
          size={PersonaSize.size24}
        />
      )}
      <div className={styles.msgWrapper}>
        <p>{moment(e?.CreatedOn).format("HH:mm")}</p>
        <div
          className={styles.messageContent}
          contentEditable={false}
          dangerouslySetInnerHTML={{
            __html: convertURLsToLinks(e?.CommentsText),
          }}
        ></div>
      </div>
      {isMyMessage && (
        <Persona
          className={styles.userAvatar}
          title={e?.Author?.Title || loginUserData?.Title}
          imageUrl={
            e?.Author?.EMail
              ? "/_layouts/15/userphoto.aspx?username=" + e?.Author?.EMail
              : "/_layouts/15/userphoto.aspx?username=" + loginUserData?.EMail
          }
          size={PersonaSize.size24}
        />
      )}
    </div>
  );
};

export default ChatBox;
