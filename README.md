# 쏙
[Website](https://sungil.me) |
[Play Store](https://play.google.com/store/apps/details?id=com.icecream.sungilmeal)

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

경기 성남 성일고등학교의 급식, 시간표, 학사일정 등 정보를 한눈에 확인할 수 있는 서비스

![image](https://yuntae.in/ssoak_thumb.png)


## Features
- 맛있는 메뉴엔 ✨표시, 실시간으로 보는 급식 피드백
- 변동사항도 반영해주는 실시간 시간표
- 한눈에 보는 이번 달 학사일정
- 우리 학교만의 공간, 익명 커뮤니티
- 우리 반끼리 공유하는 TODO 리스트

## Getting Started
1. `/firebase/firebasedb.js` 파일을 생성해, 아래와 같이 firebase 정보를 입력.

    firebase의 `프로젝트 설정` > `일반` > `내 앱` > `웹 앱 생성` > `SDK 설정 및 구성`(npm 체크) > 코드 중 **firebaseConfig** 부분 복사 후 사용.

    ```js
    import { initializeApp } from 'firebase/app';

    const firebaseConfig = { //여기를 변경 Change this
        apiKey: "AI....",
        authDomain: "example.firebaseapp.com",
        projectId: "example",
        storageBucket: "example.appspot.com",
        messagingSenderId: "12345",
        appId: "12345",
        databaseURL: "https://example-rtdb.firebaseio.com",
    };

    const firebasedb = initializeApp(firebaseConfig);

    export default firebasedb;
    ```

2. Install required dependencies:
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

2. Run the development server:
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Structure

```
📦 ssoak
├─ components
│  ├─ common
│  │  ├─ headTag.js
│  │  ├─ sidebar.js - bottomNavigation 및 sidebar 컴포넌트
│  │  ├─ spacer.js
│  │  ├─ toastEditor.js - 게시판 글쓰기 페이지에 사용되는 Editor 컴포넌트
│  └─ feed
│     ├─ installCards.js - 앱 설치 안내 팝업
│     ├─ linkCards.js - 링크 카드(학교 홈페이지, 유튜브 채널)
│     ├─ meal.js - 급식 카드 컴포넌트
│     ├─ newsletter.js - 가정통신문 카드 컴포넌트
│     ├─ notice.js - 공지사항 카드 컴포넌트
│     ├─ schedule.js - 학사일정 카드 컴포넌트
│     └─ timetable.js - 시간표 카드 컴포넌트
├─ firebase
│  ├─ firebase.js
│  └─ firebasedb.js
├─ pages
│  ├─ 404.js
│  ├─ _app.js
│  ├─ _document.js
│  ├─ api
│  │  └─ user
│  │     ├─ [id].js - user 정보 불러오는 API
│  │     └─ random_nick.js - 랜덤 닉네임 추천 API
│  ├─ community
│  │  ├─ [id].js - 게시글 페이지
│  │  ├─ edit
│  │  │  └─ [id].js - 게시글 편집 페이지
│  │  ├─ index.js - 게시글 목록 페이지
│  │  ├─ profile
│  │  │  └─ [id].js - 내 프로필 페이지
│  │  └─ write.js - 게시글 작성 페이지
│  ├─ index.js - 홈 피드 페이지
│  ├─ settings
│  │  ├─ index.js - 설정 페이지
│  │  ├─ license.js - 오픈소스 라이선스 페이지
│  │  └─ privacy.js - 개인정보 처리방침 페이지
│  └─ todo.js - 할일 페이지
├─ public
│  ├─ favicon.ico
│  ├─ icons
│  │  │  ...
│  │  └─ profileImg
│  │     └─ ...
│  ├─ manifest.json
│  ├─ screenshots
│  │  └─ ...
│  └─
├─ styles
│  └─ globals.css
├─ utils
│  ├─ date.js - 날짜 관련 함수 모음
│  ├─ meal.js - 급식 데이터 로딩 관련 함수 모음
│  ├─ schedule.js - 학사일정 데이터 로딩 관련 함수 모음
└─ └─ timetable.js - 시간표 데이터 로딩 관련 함수 모음
```


## Contributing

1. Fork the repository (https://github.com/icecream0910/ssoak/fork).
2. Create a new branch: `git checkout -b feature/<featureName>`.
3. Commit your changes: `git commit -am 'Add <featureName>'`.
4. Push to the branch: `git push origin feature/<featureName>`.
5. Submit a pull request.

## License
This project is licensed under the [MIT License](LICENSE).