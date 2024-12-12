import React, { useState, useEffect } from "react";
import { Editor, EditorState, RichUtils, Modifier, convertToRaw, convertFromRaw } from "draft-js";
import "draft-js/dist/Draft.css";
import "./App.css";

const App = () => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [title, setTitle] = useState("");

  // Load saved content from localStorage
  useEffect(() => {
    const savedContent = localStorage.getItem("editorContent");
    const savedTitle = localStorage.getItem("editorTitle");
    if (savedContent) {
      const contentState = convertFromRaw(JSON.parse(savedContent));
      setEditorState(EditorState.createWithContent(contentState));
    }
    if (savedTitle) {
      setTitle(savedTitle);
    }
  }, []);

  const handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not-handled";
  };

  const handleBeforeInput = (chars, editorState) => {
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();
    const currentBlock = contentState.getBlockForKey(selectionState.getStartKey());
    const blockText = currentBlock.getText();

    let updatedState = null;
    if (blockText === "#" && chars === " ") {
      updatedState = RichUtils.toggleBlockType(editorState, "header-one");
    } else if (blockText === "*" && chars === " ") {
      updatedState = RichUtils.toggleInlineStyle(editorState, "BOLD");
    } else if (blockText === "**" && chars === " ") {
      updatedState = RichUtils.toggleInlineStyle(editorState, "RED");
    } else if (blockText === "***" && chars === " ") {
      updatedState = RichUtils.toggleInlineStyle(editorState, "UNDERLINE");
    }

    if (updatedState) {
      const updatedContent = Modifier.replaceText(contentState, selectionState, "");
      setEditorState(EditorState.push(updatedState, updatedContent, "change-inline-style"));
      return "handled";
    }
    return "not-handled";
  };

  const saveContent = () => {
    const contentState = editorState.getCurrentContent();
    const rawContent = JSON.stringify(convertToRaw(contentState));
    localStorage.setItem("editorContent", rawContent);
    localStorage.setItem("editorTitle", title);
    alert("Content saved to localStorage!");
  };

  return (
    <div className="App">
      <input
        className="title-input"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter Title"
      />
      <div className="editor-container">
        <Editor
          editorState={editorState}
          handleKeyCommand={handleKeyCommand}
          onChange={setEditorState}
          handleBeforeInput={(chars) => handleBeforeInput(chars, editorState)}
          placeholder="Start typing here..."
        />
      </div>
      <button className="save-button" onClick={saveContent}>
        Save
      </button>
    </div>
  );
};

export default App;
