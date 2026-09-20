"""Small compatibility helper for GenLayer Direct Mode on Windows."""

import inspect
import os
import sys

if sys.platform == "win32":
    _unlink = os.unlink

    def _unlink_open_tempfile(path, *args, **kwargs):
        try:
            return _unlink(path, *args, **kwargs)
        except PermissionError:
            caller_files = [frame.filename.replace("\\", "/") for frame in inspect.stack()]
            if any(file.endswith("/gltest/direct/loader.py") for file in caller_files):
                return None
            raise

    os.unlink = _unlink_open_tempfile

# The current Direct Mode runner encodes block time at deploy and does not refresh it
# after warp(). Refresh its message context so contract calls receive the requested time.
try:
    from gltest.direct.vm import VMContext
    from gltest.direct import wasi_mock
    from gltest.direct.wasi_mock import _handle_llm_request

    _warp = VMContext.warp

    def _warp_with_message_refresh(self, timestamp):
        _warp(self, timestamp)
        if self._contract_address is not None:
            try:
                import genlayer.gl as gl

                gl.message_raw["datetime"] = timestamp
            except (ImportError, AttributeError, TypeError):
                pass

    VMContext.warp = _warp_with_message_refresh

    _handle_llm_request_original = _handle_llm_request
    _handle_gl_call_original = wasi_mock._handle_gl_call

    def _capture_prompt(vm, data):
        vm._last_prompt = data.get("prompt", "")
        return _handle_llm_request_original(vm, data)

    wasi_mock._handle_llm_request = _capture_prompt

    def _capture_gl_call(vm, request):
        if "ExecPrompt" in request:
            vm._last_prompt = request["ExecPrompt"].get("prompt", "")
        return _handle_gl_call_original(vm, request)

    wasi_mock._handle_gl_call = _capture_gl_call
except ImportError:
    pass
