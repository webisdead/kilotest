import { Page } from '@playwright/test';

export const WEBGL_MOCK_SCRIPT = `
(() => {
  const noop = () => {};
  const originalGetContext = HTMLCanvasElement.prototype.getContext;
  const GL = {
    BYTE: 5120, SHORT: 5123, UNSIGNED_BYTE: 5121, UNSIGNED_SHORT: 5123,
    UNSIGNED_INT: 5125, FLOAT: 5126, HALF_FLOAT: 5131,
    UNSIGNED_SHORT_4_4_4_4: 32819, UNSIGNED_SHORT_5_5_5_1: 32820,
    ALPHA: 6401, LUMINANCE: 5121, LUMINANCE_ALPHA: 6410, RGB: 6407, RGBA: 6408,
    RED_INTEGER: 36245, RGB_INTEGER: 36249, RGBA_INTEGER: 36250,
    DEPTH_COMPONENT: 6402, DEPTH_STENCIL: 33308, DEPTH_COMPONENT16: 33189,
    DEPTH_COMPONENT24: 33190, DEPTH_COMPONENT32F: 36012, DEPTH24_STENCIL8: 36186,
    TEXTURE_MAG_FILTER: 10240, TEXTURE_MIN_FILTER: 10241,
    TEXTURE_WRAP_S: 10252, TEXTURE_WRAP_T: 10253, TEXTURE_WRAP_R: 33074,
    TEXTURE_BASE_LEVEL: 33084, TEXTURE_MAX_LEVEL: 33085,
    TEXTURE_MIN_LOD: 33086, TEXTURE_MAX_LOD: 33087,
    TEXTURE_COMPARE_MODE: 33096, TEXTURE_COMPARE_FUNC: 33095,
    TEXTURE_MAX_ANISOTROPY_EXT: 34047,
    CLAMP_TO_EDGE: 33071, LINEAR: 9729, NEAREST: 9728,
    LINEAR_MIPMAP_LINEAR: 9981, LINEAR_MIPMAP_NEAREST: 9980,
    NEAREST_MIPMAP_LINEAR: 9983, NEAREST_MIPMAP_NEAREST: 9984,
    ARRAY_BUFFER: 34962, ELEMENT_ARRAY_BUFFER: 34963,
    ARRAY_BUFFER_BINDING: 34964, ELEMENT_ARRAY_BUFFER_BINDING: 34965,
    STREAM_DRAW: 35040, STATIC_DRAW: 35044, DYNAMIC_DRAW: 35047,
    UNPACK_ALIGNMENT: 3316, UNPACK_FLIP_Y_WEBGL: 37004,
    UNPACK_PREMULTIPLY_ALPHA_WEBGL: 37006,
    COLOR_BUFFER_BIT: 16384, DEPTH_BUFFER_BIT: 256, STENCIL_BUFFER_BIT: 8192,
    CULL_FACE: 2834, FRONT: 1028, BACK: 1029, FRONT_AND_BACK: 1032,
    CCW: 2329, CW: 2330, DEPTH_TEST: 2929, STENCIL_TEST: 2929, BLEND: 3042,
    SRC_ALPHA: 771, ONE_MINUS_SRC_ALPHA: 770, SRC_COLOR: 760,
    ONE_MINUS_SRC_COLOR: 769, DST_COLOR: 762, ONE_MINUS_DST_COLOR: 767,
    FUNC_ADD: 32774, FUNC_SUBTRACT: 32778, FUNC_REVERSE_SUBTRACT: 32779,
    SRC_ALPHA_SATURATE: 32770, CONSTANT_COLOR: 32773, ONE_MINUS_CONSTANT_COLOR: 32774,
    CONSTANT_ALPHA: 32775, ONE_MINUS_CONSTANT_ALPHA: 32776,
    TRIANGLES: 4, TRIANGLE_STRIP: 3, TRIANGLE_FAN: 6,
    POINTS: 0, LINES: 1, LINE_STRIP: 3, LINE_LOOP: 2,
    VENDOR: 7936, RENDERER: 7937, VERSION: 7938, SHADING_LANGUAGE_VERSION: 35724,
    MAX_TEXTURE_SIZE: 3379, MAX_TEXTURE_IMAGE_UNITS: 34017,
    MAX_VERTEX_TEXTURE_IMAGE_UNITS: 33157, MAX_CUBE_MAP_TEXTURE_SIZE: 34076,
    MAX_VERTEX_ATTRIBS: 33149, MAX_VERTEX_UNIFORM_VECTORS: 36235,
    MAX_VARYING_VECTORS: 36236, MAX_FRAGMENT_UNIFORM_VECTORS: 36237,
    MAX_COMBINED_TEXTURE_IMAGE_UNITS: 33130,
    MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS: 33378,
    MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS: 33378,
    ALIASED_LINE_WIDTH_RANGE: 33102, ALIASED_POINT_SIZE_RANGE: 33121,
    LOW_FLOAT: 36012, MEDIUM_FLOAT: 36013, HIGH_FLOAT: 36014,
    LOW_INT: 36005, MEDIUM_INT: 36006, HIGH_INT: 36007,
    FRAGMENT_SHADER: 35632, VERTEX_SHADER: 35628,
    COMPILE_STATUS: 36396, LINK_STATUS: 35714, SHADER_TYPE: 35683,
    MAX_SAMPLES: 36011,
  };

  const createContext = function(type) {
    if (typeof type === 'string' && (type.indexOf('webgl') !== -1 || type === 'experimental-webgl')) {
      const constants = {};
      for (const key in GL) constants[key] = GL[key];
      
      const ctx = Object.assign(Object.create(Object.prototype), constants);
      ctx.constructor = function WebGLRenderingContext() {};
      ctx.VERSION = 'WebGL 1.0';
      ctx.SHADING_LANGUAGE_VERSION = 'WebGL GLSL ES 1.0';
      ctx.VENDOR = 'Test'; ctx.RENDERER = 'Test';
      ctx.canvas = this;
      ctx.isContextLost = () => false;
      ctx.getContextAttributes = () => ({ alpha: false, depth: true, stencil: false, antialias: false });
      ctx.getError = () => 0; ctx.checkFramebufferStatus = () => 0x8cd5;
      ctx.isTexture = () => true; ctx.isBuffer = () => true; ctx.isFramebuffer = () => true;
      ctx.isRenderbuffer = () => true; ctx.isProgram = () => true; ctx.isShader = () => true;
      ctx.getProgramInfoLog = () => ''; ctx.getShaderInfoLog = () => '';
      ctx.getFragDataLocation = () => 0; ctx.getFragDataIndex = () => -1;
      ctx.getShaderPrecisionFormat = () => ({ precision: 23, rangeMin: 127, rangeMax: 127 });
      ctx.getParameter = function(p) {
        if (typeof p === 'string') return p;
        switch (p) {
          case GL.VERSION: return 'WebGL 1.0';
          case GL.SHADING_LANGUAGE_VERSION: return 'WebGL GLSL ES 1.0';
          case GL.VENDOR: return 'Test'; case GL.RENDERER: return 'Test';
          case GL.MAX_TEXTURE_SIZE: return 2048;
          case GL.MAX_TEXTURE_IMAGE_UNITS: return 32;
          case GL.MAX_VERTEX_TEXTURE_IMAGE_UNITS: return 16;
          case GL.MAX_CUBE_MAP_TEXTURE_SIZE: return 1024;
          case GL.MAX_VERTEX_ATTRIBS: return 16;
          case GL.MAX_VERTEX_UNIFORM_VECTORS: return 256;
          case GL.MAX_VARYING_VECTORS: return 16;
          case GL.MAX_FRAGMENT_UNIFORM_VECTORS: return 256;
          case GL.MAX_COMBINED_TEXTURE_IMAGE_UNITS: return 64;
          case GL.ALIASED_LINE_WIDTH_RANGE: return [1.0, 1.0];
          case GL.ALIASED_POINT_SIZE_RANGE: return [1.0, 1.0];
          case GL.MAX_SAMPLES: return 0;
          default: return 0;
        }
      };
      const anisotropicExt = { MAX_TEXTURE_MAX_ANISOTROPY_EXT: 16 };
      const extMap = {
        'EXT_texture_filter_anisotropic': anisotropicExt,
        'OES_texture_float': {}, 'OES_texture_half_float': {},
        'OES_texture_float_linear': {}, 'OES_texture_half_float_linear': {},
        'OES_standard_derivatives': {}, 'OES_element_index_uint': {},
        'OES_vertex_array_object': {}, 'EXT_color_buffer_half_float': {}, 'EXT_color_buffer_float': {},
        'WEBGL_depth_texture': {}, 'WEBGL_draw_buffers': {},
      };
      ctx.getExtension = (name) => extMap[name] || null;
      const noopMethods = [
        'enable','disable','bindBuffer','bindTexture','bindFramebuffer','bindRenderbuffer',
        'bindAttribLocation','bindVertexArray','bufferData','bufferSubData','texImage2D',
        'texSubImage2D','texParameteri','texParameterf','generateMipmap','clear','clearColor',
        'clearDepth','clearStencil','enableVertexAttribArray','disableVertexAttribArray',
        'vertexAttribPointer','vertexAttrib1f','vertexAttrib2f','vertexAttrib3f','vertexAttrib4f',
        'vertexAttrib1fv','vertexAttrib2fv','vertexAttrib3fv','vertexAttrib4fv','vertexAttribDivisor',
        'uniform1f','uniform2f','uniform3f','uniform4f','uniform1i','uniform2i','uniform3i','uniform4i',
        'uniform1fv','uniform2fv','uniform3fv','uniform4fv','uniformMatrix2fv','uniformMatrix3fv',
        'uniformMatrix4fv','createBuffer','createTexture','createProgram','createShader',
        'createFramebuffer','createRenderbuffer','createVertexArray','createSampler',
        'createTransformFeedback','createQuery','deleteBuffer','deleteTexture','deleteProgram',
        'deleteShader','deleteFramebuffer','deleteRenderbuffer','deleteVertexArray',
        'drawArrays','drawElements','drawArraysInstanced','drawElementsInstanced','drawBuffers',
        'readPixels','pixelStorei','viewport','scissor','colorMask','depthFunc','depthMask',
        'frontFace','cullFace','stencilFunc','stencilOp','stencilMask','blendEquation',
        'blendEquationSeparate','blendFunc','blendFuncSeparate','blendColor','polygonOffset',
        'hint','lineWidth','flush','finish','invalidateFramebuffer','readBuffer',
        'renderbufferStorage','compressedTexImage2D','framebufferRenderbuffer','framebufferTexture2D',
        'bindSampler','getSyncParameter','clientWaitSync','waitSync','deleteSync','fenceSync',
        'deleteQuery','deleteSampler','deleteTransformFeedback','bindUniformBuffer',
        'uniformBlockBinding','getUniformBlockIndex','getUniformIndices','bindVertexArray',
        'bindImageTexture','memoryBarrier','memoryBarrierByRegion',
        'pauseTransformFeedback','resumeTransformFeedback','endTransformFeedback',
        'beginQuery','endQuery','beginTransformFeedback','bindTransformFeedback','bindQuery',
        'clearBufferfv','clearBufferfi','clearBufferiv','clearBufferuiv',
        'depthRange','enableTextureSRGB','bindImageTexture','getInternalFormatParameter',
      ];
      for (const m of noopMethods) if (!(m in ctx)) ctx[m] = noop;
      ctx.getAttribLocation = () => 0;
      ctx.getUniformLocation = () => ({});
      ctx.getActiveAttrib = () => null;
      ctx.getActiveUniform = () => null;
      ctx.getUniform = () => null;
      ctx.getVertexAttrib = () => ({});
      ctx.getVertexAttribOffset = () => 0;
      return ctx;
    }
    return originalGetContext.call(this, type);
  };
  HTMLCanvasElement.prototype.getContext = createContext;
})();
`;

export async function setupWebGLMock(page: Page) {
  await page.addInitScript(WEBGL_MOCK_SCRIPT);
}

export const NAV_OPTIONS = { waitUntil: 'commit' as const, timeout: 15000 };
