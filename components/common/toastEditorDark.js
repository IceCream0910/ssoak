import '@toast-ui/editor/dist/toastui-editor.css';
import '@toast-ui/editor/dist/i18n/ko-kr';
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css';
import { useEffect, useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { Editor } from '@toast-ui/react-editor';

const EditorBoxDark = (props) => {
    const editorRef = useRef();

    function getMarkdown() {
        if (editorRef.current) {
            return editorRef.current.getInstance().getMarkdown();
        }
    }

    const toolbarItems = [
        ['bold', 'italic', 'strike', 'image'],
        ['hr'],
        ['ul', 'ol', 'task'],
        ['link'],
        [],
    ];

    useEffect(() => {
        if (props.content) {
            editorRef.current.getInstance().setMarkdown(props.content);
        }
    }, [props.content]);

    let timerId;

    function debounce(func, delay) {
        return function () {
            clearTimeout(timerId);
            timerId = setTimeout(func, delay);
        };
    }

    function handleChangeEditor() {
        const content = getMarkdown();
        localStorage.setItem('ssoak_editor_content', content);
    }

    const debouncedHandleChangeEditor = debounce(handleChangeEditor, 100);


    return (
        <div className="edit_wrap">
            <Editor
                onChange={debouncedHandleChangeEditor}
                initialValue={props.content}
                ref={editorRef}
                initialEditType="wysiwyg"
                language="ko-KR"
                hideModeSwitch={false}
                theme={'dark'}
                usageStatistics={false}
                toolbarItems={toolbarItems}
                useCommandShortcut={true}
                height="60dvh"
                placeholder="내용을 입력하세요"
            />
        </div>
    );
}

export default EditorBoxDark;