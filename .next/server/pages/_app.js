/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "./src/context/AppState.tsx":
/*!**********************************!*\
  !*** ./src/context/AppState.tsx ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   AppStateProvider: () => (/* binding */ AppStateProvider),\n/* harmony export */   useAppState: () => (/* binding */ useAppState)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n\n\nconst AppContext = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_1__.createContext)(undefined);\nconst AppStateProvider = ({ children, initialTab, initialSavedItems })=>{\n    const [activeTab, setActiveTab] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(initialTab || \"vola-vola\");\n    const [savedItems, setSavedItems] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(initialSavedItems || []);\n    const [drops, setDrops] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)([]);\n    const toggleSaveItem = (id)=>{\n        setSavedItems((prev)=>prev.includes(id) ? prev.filter((item)=>item !== id) : [\n                ...prev,\n                id\n            ]);\n    };\n    const addDrop = (id)=>{\n        setDrops((prev)=>prev.includes(id) ? prev : [\n                ...prev,\n                id\n            ]);\n    };\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(AppContext.Provider, {\n        value: {\n            activeTab,\n            setActiveTab,\n            savedItems,\n            toggleSaveItem,\n            drops,\n            addDrop\n        },\n        children: children\n    }, void 0, false, {\n        fileName: \"/Users/lorenzospavone/.gemini/antigravity/scratch/nomaq/src/context/AppState.tsx\",\n        lineNumber: 36,\n        columnNumber: 5\n    }, undefined);\n};\nconst useAppState = ()=>{\n    const context = (0,react__WEBPACK_IMPORTED_MODULE_1__.useContext)(AppContext);\n    if (!context) {\n        throw new Error(\"useAppState must be used within an AppStateProvider\");\n    }\n    return context;\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvY29udGV4dC9BcHBTdGF0ZS50c3giLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFtRTtBQWFuRSxNQUFNSSwyQkFBYUgsb0RBQWFBLENBQTZCSTtBQUV0RCxNQUFNQyxtQkFJUixDQUFDLEVBQUVDLFFBQVEsRUFBRUMsVUFBVSxFQUFFQyxpQkFBaUIsRUFBRTtJQUMvQyxNQUFNLENBQUNDLFdBQVdDLGFBQWEsR0FBR1IsK0NBQVFBLENBQVFLLGNBQWM7SUFDaEUsTUFBTSxDQUFDSSxZQUFZQyxjQUFjLEdBQUdWLCtDQUFRQSxDQUFXTSxxQkFBcUIsRUFBRTtJQUM5RSxNQUFNLENBQUNLLE9BQU9DLFNBQVMsR0FBR1osK0NBQVFBLENBQVcsRUFBRTtJQUUvQyxNQUFNYSxpQkFBaUIsQ0FBQ0M7UUFDdEJKLGNBQWMsQ0FBQ0ssT0FDYkEsS0FBS0MsUUFBUSxDQUFDRixNQUFNQyxLQUFLRSxNQUFNLENBQUMsQ0FBQ0MsT0FBU0EsU0FBU0osTUFBTTttQkFBSUM7Z0JBQU1EO2FBQUc7SUFFMUU7SUFFQSxNQUFNSyxVQUFVLENBQUNMO1FBQ2ZGLFNBQVMsQ0FBQ0csT0FBVUEsS0FBS0MsUUFBUSxDQUFDRixNQUFNQyxPQUFPO21CQUFJQTtnQkFBTUQ7YUFBRztJQUM5RDtJQUVBLHFCQUNFLDhEQUFDYixXQUFXbUIsUUFBUTtRQUNsQkMsT0FBTztZQUNMZDtZQUNBQztZQUNBQztZQUNBSTtZQUNBRjtZQUNBUTtRQUNGO2tCQUVDZjs7Ozs7O0FBR1AsRUFBRTtBQUVLLE1BQU1rQixjQUFjO0lBQ3pCLE1BQU1DLFVBQVV4QixpREFBVUEsQ0FBQ0U7SUFDM0IsSUFBSSxDQUFDc0IsU0FBUztRQUNaLE1BQU0sSUFBSUMsTUFBTTtJQUNsQjtJQUNBLE9BQU9EO0FBQ1QsRUFBRSIsInNvdXJjZXMiOlsid2VicGFjazovL25vbWFxLy4vc3JjL2NvbnRleHQvQXBwU3RhdGUudHN4P2NjMjMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0LCB7IGNyZWF0ZUNvbnRleHQsIHVzZUNvbnRleHQsIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xuXG5leHBvcnQgdHlwZSBUYWJJZCA9ICd2b2xhLXZvbGEnIHwgJ3NvZ2dpb3JuYScgfCAnZHJvcHMnIHwgJ3NhbHZhdGknIHwgJ3Byb2ZpbG8nO1xuXG5pbnRlcmZhY2UgQXBwQ29udGV4dFR5cGUge1xuICBhY3RpdmVUYWI6IFRhYklkO1xuICBzZXRBY3RpdmVUYWI6ICh0YWI6IFRhYklkKSA9PiB2b2lkO1xuICBzYXZlZEl0ZW1zOiBzdHJpbmdbXTtcbiAgdG9nZ2xlU2F2ZUl0ZW06IChpZDogc3RyaW5nKSA9PiB2b2lkO1xuICBkcm9wczogc3RyaW5nW107XG4gIGFkZERyb3A6IChpZDogc3RyaW5nKSA9PiB2b2lkO1xufVxuXG5jb25zdCBBcHBDb250ZXh0ID0gY3JlYXRlQ29udGV4dDxBcHBDb250ZXh0VHlwZSB8IHVuZGVmaW5lZD4odW5kZWZpbmVkKTtcblxuZXhwb3J0IGNvbnN0IEFwcFN0YXRlUHJvdmlkZXI6IFJlYWN0LkZDPHtcbiAgY2hpbGRyZW46IFJlYWN0LlJlYWN0Tm9kZTtcbiAgaW5pdGlhbFRhYj86IFRhYklkO1xuICBpbml0aWFsU2F2ZWRJdGVtcz86IHN0cmluZ1tdO1xufT4gPSAoeyBjaGlsZHJlbiwgaW5pdGlhbFRhYiwgaW5pdGlhbFNhdmVkSXRlbXMgfSkgPT4ge1xuICBjb25zdCBbYWN0aXZlVGFiLCBzZXRBY3RpdmVUYWJdID0gdXNlU3RhdGU8VGFiSWQ+KGluaXRpYWxUYWIgfHwgJ3ZvbGEtdm9sYScpO1xuICBjb25zdCBbc2F2ZWRJdGVtcywgc2V0U2F2ZWRJdGVtc10gPSB1c2VTdGF0ZTxzdHJpbmdbXT4oaW5pdGlhbFNhdmVkSXRlbXMgfHwgW10pO1xuICBjb25zdCBbZHJvcHMsIHNldERyb3BzXSA9IHVzZVN0YXRlPHN0cmluZ1tdPihbXSk7XG5cbiAgY29uc3QgdG9nZ2xlU2F2ZUl0ZW0gPSAoaWQ6IHN0cmluZykgPT4ge1xuICAgIHNldFNhdmVkSXRlbXMoKHByZXYpID0+XG4gICAgICBwcmV2LmluY2x1ZGVzKGlkKSA/IHByZXYuZmlsdGVyKChpdGVtKSA9PiBpdGVtICE9PSBpZCkgOiBbLi4ucHJldiwgaWRdXG4gICAgKTtcbiAgfTtcblxuICBjb25zdCBhZGREcm9wID0gKGlkOiBzdHJpbmcpID0+IHtcbiAgICBzZXREcm9wcygocHJldikgPT4gKHByZXYuaW5jbHVkZXMoaWQpID8gcHJldiA6IFsuLi5wcmV2LCBpZF0pKTtcbiAgfTtcblxuICByZXR1cm4gKFxuICAgIDxBcHBDb250ZXh0LlByb3ZpZGVyXG4gICAgICB2YWx1ZT17e1xuICAgICAgICBhY3RpdmVUYWIsXG4gICAgICAgIHNldEFjdGl2ZVRhYixcbiAgICAgICAgc2F2ZWRJdGVtcyxcbiAgICAgICAgdG9nZ2xlU2F2ZUl0ZW0sXG4gICAgICAgIGRyb3BzLFxuICAgICAgICBhZGREcm9wLFxuICAgICAgfX1cbiAgICA+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9BcHBDb250ZXh0LlByb3ZpZGVyPlxuICApO1xufTtcblxuZXhwb3J0IGNvbnN0IHVzZUFwcFN0YXRlID0gKCkgPT4ge1xuICBjb25zdCBjb250ZXh0ID0gdXNlQ29udGV4dChBcHBDb250ZXh0KTtcbiAgaWYgKCFjb250ZXh0KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd1c2VBcHBTdGF0ZSBtdXN0IGJlIHVzZWQgd2l0aGluIGFuIEFwcFN0YXRlUHJvdmlkZXInKTtcbiAgfVxuICByZXR1cm4gY29udGV4dDtcbn07XG4iXSwibmFtZXMiOlsiUmVhY3QiLCJjcmVhdGVDb250ZXh0IiwidXNlQ29udGV4dCIsInVzZVN0YXRlIiwiQXBwQ29udGV4dCIsInVuZGVmaW5lZCIsIkFwcFN0YXRlUHJvdmlkZXIiLCJjaGlsZHJlbiIsImluaXRpYWxUYWIiLCJpbml0aWFsU2F2ZWRJdGVtcyIsImFjdGl2ZVRhYiIsInNldEFjdGl2ZVRhYiIsInNhdmVkSXRlbXMiLCJzZXRTYXZlZEl0ZW1zIiwiZHJvcHMiLCJzZXREcm9wcyIsInRvZ2dsZVNhdmVJdGVtIiwiaWQiLCJwcmV2IiwiaW5jbHVkZXMiLCJmaWx0ZXIiLCJpdGVtIiwiYWRkRHJvcCIsIlByb3ZpZGVyIiwidmFsdWUiLCJ1c2VBcHBTdGF0ZSIsImNvbnRleHQiLCJFcnJvciJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./src/context/AppState.tsx\n");

/***/ }),

/***/ "./src/pages/_app.tsx":
/*!****************************!*\
  !*** ./src/pages/_app.tsx ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ App)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/styles/globals.css */ \"./src/styles/globals.css\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_styles_globals_css__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _context_AppState__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/context/AppState */ \"./src/context/AppState.tsx\");\n\n\n\nfunction App({ Component, pageProps }) {\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_context_AppState__WEBPACK_IMPORTED_MODULE_2__.AppStateProvider, {\n        initialTab: pageProps.initialTab,\n        initialSavedItems: pageProps.initialSavedItems,\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n            ...pageProps\n        }, void 0, false, {\n            fileName: \"/Users/lorenzospavone/.gemini/antigravity/scratch/nomaq/src/pages/_app.tsx\",\n            lineNumber: 11,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"/Users/lorenzospavone/.gemini/antigravity/scratch/nomaq/src/pages/_app.tsx\",\n        lineNumber: 7,\n        columnNumber: 5\n    }, this);\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvcGFnZXMvX2FwcC50c3giLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUE4QjtBQUV3QjtBQUV2QyxTQUFTQyxJQUFJLEVBQUVDLFNBQVMsRUFBRUMsU0FBUyxFQUFZO0lBQzVELHFCQUNFLDhEQUFDSCwrREFBZ0JBO1FBQ2ZJLFlBQVlELFVBQVVDLFVBQVU7UUFDaENDLG1CQUFtQkYsVUFBVUUsaUJBQWlCO2tCQUU5Qyw0RUFBQ0g7WUFBVyxHQUFHQyxTQUFTOzs7Ozs7Ozs7OztBQUc5QiIsInNvdXJjZXMiOlsid2VicGFjazovL25vbWFxLy4vc3JjL3BhZ2VzL19hcHAudHN4P2Y5ZDYiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICdAL3N0eWxlcy9nbG9iYWxzLmNzcyc7XG5pbXBvcnQgdHlwZSB7IEFwcFByb3BzIH0gZnJvbSAnbmV4dC9hcHAnO1xuaW1wb3J0IHsgQXBwU3RhdGVQcm92aWRlciB9IGZyb20gJ0AvY29udGV4dC9BcHBTdGF0ZSc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEFwcCh7IENvbXBvbmVudCwgcGFnZVByb3BzIH06IEFwcFByb3BzKSB7XG4gIHJldHVybiAoXG4gICAgPEFwcFN0YXRlUHJvdmlkZXJcbiAgICAgIGluaXRpYWxUYWI9e3BhZ2VQcm9wcy5pbml0aWFsVGFifVxuICAgICAgaW5pdGlhbFNhdmVkSXRlbXM9e3BhZ2VQcm9wcy5pbml0aWFsU2F2ZWRJdGVtc31cbiAgICA+XG4gICAgICA8Q29tcG9uZW50IHsuLi5wYWdlUHJvcHN9IC8+XG4gICAgPC9BcHBTdGF0ZVByb3ZpZGVyPlxuICApO1xufVxuIl0sIm5hbWVzIjpbIkFwcFN0YXRlUHJvdmlkZXIiLCJBcHAiLCJDb21wb25lbnQiLCJwYWdlUHJvcHMiLCJpbml0aWFsVGFiIiwiaW5pdGlhbFNhdmVkSXRlbXMiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./src/pages/_app.tsx\n");

/***/ }),

/***/ "./src/styles/globals.css":
/*!********************************!*\
  !*** ./src/styles/globals.css ***!
  \********************************/
/***/ (() => {



/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-dev-runtime");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__("./src/pages/_app.tsx"));
module.exports = __webpack_exports__;

})();