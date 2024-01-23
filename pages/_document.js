import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {

  return (
    <Html lang="ko">
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <script type="module" src="https://bks0c7yrb0.execute-api.ap-northeast-2.amazonaws.com/v1/api/fontstream/djs/?sid=gAAAAABkOnZ6UuK5Iwj_IqmStZB7S_-4eUhn8Y5BUDTOJ9q93g1GMumfHElFVWVWmHq9gTgHWvMGf5AscOhluEz03ZxtXeFDCJAHUiunbM7czbhbOYs4oMon5e4j8_B328KEALPpZhOHUcgiMiHrD_Y0jPU4psKCnvFCw_tXX1bgo8_PGFsZ4DRBhpeEb6sobtPp2YnNlYkFYQ7fJNonqmI_pCmNNTgFyl0Efw7w-cgNfiw_hFiM55wj4P0ACetBmpG2GpOpDgEi" charset="utf-8"></script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
