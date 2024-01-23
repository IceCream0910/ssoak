import '@toast-ui/editor/dist/toastui-editor.css';
import '@toast-ui/editor/dist/i18n/ko-kr';
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css';
import { useEffect, useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { Editor } from '@toast-ui/react-editor';

const EditorBox = forwardRef((props, ref) => {
    useImperativeHandle(ref, () => ({
        getMarkdown
    }))

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

    return (
        <div className="edit_wrap">
            <Editor
                initialValue={props.content || ''}
                ref={editorRef}
                initialEditType="wysiwyg"
                language="ko-KR"
                hideModeSwitch={false}
                theme={''}
                usageStatistics={false}
                toolbarItems={toolbarItems}
                useCommandShortcut={true}
                height="60dvh"
                placeholder="내용을 입력하세요"
            />
        </div>
    );
}
);

export default EditorBox;