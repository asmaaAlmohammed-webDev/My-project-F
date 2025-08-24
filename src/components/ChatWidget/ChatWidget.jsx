import { useState } from "react";
import ChatBot from "./../ChatBot/ChatBot";
import "./ChatWidget.css";
import { BiMessageDots } from "react-icons/bi";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {!isOpen && (
        <div className="chat-widget-wrapper">
          <button
            className="chat-widget-button"
            onClick={() => setIsOpen(true)}
          >
            <BiMessageDots />
            {/* animate ping*/}
            <span className="chat-widget-ping"></span>
            <span className="chat-widget-dot"></span>
          </button>
        </div>
      )}

      {/*Bot window*/}
      <ChatBot isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
