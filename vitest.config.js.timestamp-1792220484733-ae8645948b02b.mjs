// vitest.config.js
import { defineConfig } from "file:///C:/Users/User/OneDrive%20-%20Monash%20University/Documents/Y2S2/FIT3170/Repository/fit3170_project1/node_modules/vitest/dist/config.js";
import { VitestMarkdownReporter } from "file:///C:/Users/User/OneDrive%20-%20Monash%20University/Documents/Y2S2/FIT3170/Repository/fit3170_project1/node_modules/vitest-markdown-reporter/lib/index.js";
var vitest_config_default = defineConfig({
  test: {
    env: {
      MONGO_URI_TEST: "mongodb://localhost:27017/lostfound_test"
    },
    globals: true,
    environment: "jsdom",
    setupFiles: "./tests/setup/setup.js",
    include: [
      "tests/unit/**/*.{test,spec}.{js,jsx,ts,tsx}",
      "tests/integration/**/*.{test,spec}.{js,jsx,ts,tsx}"
    ],
    exclude: ["tests/e2e/**", "node_modules/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "cobertura", "html"]
    },
    reporters: ["default", "junit", "html", new VitestMarkdownReporter()],
    outputFile: {
      junit: "vitest-junit.xml",
      markdown: "reports/vitest-report.md"
    }
  }
});
export {
  vitest_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZXN0LmNvbmZpZy5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXFVzZXJcXFxcT25lRHJpdmUgLSBNb25hc2ggVW5pdmVyc2l0eVxcXFxEb2N1bWVudHNcXFxcWTJTMlxcXFxGSVQzMTcwXFxcXFJlcG9zaXRvcnlcXFxcZml0MzE3MF9wcm9qZWN0MVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcVXNlclxcXFxPbmVEcml2ZSAtIE1vbmFzaCBVbml2ZXJzaXR5XFxcXERvY3VtZW50c1xcXFxZMlMyXFxcXEZJVDMxNzBcXFxcUmVwb3NpdG9yeVxcXFxmaXQzMTcwX3Byb2plY3QxXFxcXHZpdGVzdC5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL1VzZXIvT25lRHJpdmUlMjAtJTIwTW9uYXNoJTIwVW5pdmVyc2l0eS9Eb2N1bWVudHMvWTJTMi9GSVQzMTcwL1JlcG9zaXRvcnkvZml0MzE3MF9wcm9qZWN0MS92aXRlc3QuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZXN0L2NvbmZpZyc7XHJcbmltcG9ydCB7IFZpdGVzdE1hcmtkb3duUmVwb3J0ZXIgfSBmcm9tICd2aXRlc3QtbWFya2Rvd24tcmVwb3J0ZXInO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICB0ZXN0OiB7XHJcbiAgICBlbnY6IHtcclxuICAgICAgTU9OR09fVVJJX1RFU1Q6ICdtb25nb2RiOi8vbG9jYWxob3N0OjI3MDE3L2xvc3Rmb3VuZF90ZXN0JyxcclxuICAgIH0sXHJcbiAgICBnbG9iYWxzOiB0cnVlLFxyXG4gICAgZW52aXJvbm1lbnQ6ICdqc2RvbScsXHJcbiAgICBzZXR1cEZpbGVzOiAnLi90ZXN0cy9zZXR1cC9zZXR1cC5qcycsXHJcbiAgICBpbmNsdWRlOiBbXHJcbiAgICAgICd0ZXN0cy91bml0LyoqLyoue3Rlc3Qsc3BlY30ue2pzLGpzeCx0cyx0c3h9JyxcclxuICAgICAgJ3Rlc3RzL2ludGVncmF0aW9uLyoqLyoue3Rlc3Qsc3BlY30ue2pzLGpzeCx0cyx0c3h9JyxcclxuICAgIF0sXHJcbiAgICBleGNsdWRlOiBbJ3Rlc3RzL2UyZS8qKicsICdub2RlX21vZHVsZXMvKionXSxcclxuICAgIGNvdmVyYWdlOiB7XHJcbiAgICAgIHByb3ZpZGVyOiAndjgnLFxyXG4gICAgICByZXBvcnRlcjogWyd0ZXh0JywgJ2NvYmVydHVyYScsICdodG1sJ10sXHJcbiAgICB9LFxyXG4gICAgcmVwb3J0ZXJzOiBbJ2RlZmF1bHQnLCAnanVuaXQnLCAnaHRtbCcsIG5ldyBWaXRlc3RNYXJrZG93blJlcG9ydGVyKCldLFxyXG4gICAgb3V0cHV0RmlsZToge1xyXG4gICAgICBqdW5pdDogJ3ZpdGVzdC1qdW5pdC54bWwnLFxyXG4gICAgICBtYXJrZG93bjogJ3JlcG9ydHMvdml0ZXN0LXJlcG9ydC5tZCdcclxuICAgIH0sXHJcbiAgfSxcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBcWUsU0FBUyxvQkFBb0I7QUFDbGdCLFNBQVMsOEJBQThCO0FBRXZDLElBQU8sd0JBQVEsYUFBYTtBQUFBLEVBQzFCLE1BQU07QUFBQSxJQUNKLEtBQUs7QUFBQSxNQUNILGdCQUFnQjtBQUFBLElBQ2xCO0FBQUEsSUFDQSxTQUFTO0FBQUEsSUFDVCxhQUFhO0FBQUEsSUFDYixZQUFZO0FBQUEsSUFDWixTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTLENBQUMsZ0JBQWdCLGlCQUFpQjtBQUFBLElBQzNDLFVBQVU7QUFBQSxNQUNSLFVBQVU7QUFBQSxNQUNWLFVBQVUsQ0FBQyxRQUFRLGFBQWEsTUFBTTtBQUFBLElBQ3hDO0FBQUEsSUFDQSxXQUFXLENBQUMsV0FBVyxTQUFTLFFBQVEsSUFBSSx1QkFBdUIsQ0FBQztBQUFBLElBQ3BFLFlBQVk7QUFBQSxNQUNWLE9BQU87QUFBQSxNQUNQLFVBQVU7QUFBQSxJQUNaO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
