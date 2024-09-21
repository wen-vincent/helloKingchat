/*
 * Copyright (c) 2024 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#include <ace/xcomponent/native_interface_xcomponent.h>
#include <cstdint>
#include <string>
#include "plugin_manager.h"
#include "common/log_common.h"

PluginManager::~PluginManager() {
    DRAWING_LOGI("~PluginManager");
    for (auto iter = nativeXComponentMap_.begin(); iter != nativeXComponentMap_.end(); ++iter) {
        if (iter->second != nullptr) {
            delete iter->second;
            iter->second = nullptr;
        }
    }
    nativeXComponentMap_.clear();

    for (auto iter = pluginRenderMap_.begin(); iter != pluginRenderMap_.end(); ++iter) {
        if (iter->second != nullptr) {
            delete iter->second;
            iter->second = nullptr;
        }
    }
    pluginRenderMap_.clear();
}

void PluginManager::SetNativeXComponent(std::string &id, OH_NativeXComponent *nativeXComponent) {
    DRAWING_LOGI("set native xComponent, ID = %{public}s.", id.c_str());
    if (nativeXComponent == nullptr) {
        return;
    }

    auto [iter, inserted] = nativeXComponentMap_.try_emplace(id, nativeXComponent);
    if (!inserted && iter->second != nativeXComponent) {
        delete iter->second;
        iter->second = nativeXComponent;
    }
}

SampleBitMap *PluginManager::GetRender(std::string &id) {
    if (pluginRenderMap_.find(id) == pluginRenderMap_.end()) {
        SampleBitMap *instance = SampleBitMap::GetInstance(id);
        pluginRenderMap_[id] = instance;
        return instance;
    }
    return pluginRenderMap_[id];
}

PluginManager *PluginManager::GetInstance() {
    static PluginManager pluginManager;
    return &pluginManager;
}

void PluginManager::Export(napi_env env, napi_value exports) {
    if ((env == nullptr) || (exports == nullptr)) {
        OH_LOG_Print(LOG_APP, LOG_ERROR, LOG_DOMAIN, "mytest", "exports is null");
        return;
    }
    
    napi_value exportInstance = nullptr;
    if (napi_get_named_property(env, exports, OH_NATIVE_XCOMPONENT_OBJ, &exportInstance) != napi_ok) {
        OH_LOG_Print(LOG_APP, LOG_ERROR, LOG_DOMAIN, "mytest", "napi_get_named_property error");
        return;
    }

    OH_NativeXComponent *nativeXComponent = nullptr;
    if (napi_unwrap(env, exportInstance, reinterpret_cast<void **>(&nativeXComponent)) != napi_ok) {
        OH_LOG_Print(LOG_APP, LOG_ERROR, LOG_DOMAIN, "mytest", "napi_unwrap error");
        return;
    }

    char idStr[OH_XCOMPONENT_ID_LEN_MAX + 1] = {'\0'};
    uint64_t idSize = OH_XCOMPONENT_ID_LEN_MAX + 1;
    if (OH_NativeXComponent_GetXComponentId(nativeXComponent, idStr, &idSize) != OH_NATIVEXCOMPONENT_RESULT_SUCCESS) {
        OH_LOG_Print(LOG_APP, LOG_ERROR, LOG_DOMAIN, "mytest", "OH_NativeXComponent_GetXComponentId error");
        return;
    }

    std::string id(idStr);
    auto context = PluginManager::GetInstance();
    if ((context != nullptr) && (nativeXComponent != nullptr)) {
        context->SetNativeXComponent(id, nativeXComponent);
        auto render = context->GetRender(id);
        if (render != nullptr) {
            render->RegisterCallback(nativeXComponent);
            render->Export(env, exports);
        }
    }
    OH_LOG_Print(LOG_APP, LOG_DEBUG, LOG_DOMAIN, "mytest", "exports is ok");
}
//
// EXTERN_C_START
// static napi_value Init(napi_env env, napi_value exports)
// {
//     DRAWING_LOGI("napi init");
//     PluginManager::GetInstance()->Export(env, exports);
//     return exports;
// }
// EXTERN_C_END
//
// static napi_module demoModule = {
//     .nm_version = 1,
//     .nm_flags = 0,
//     .nm_filename = nullptr,
//     .nm_register_func = Init,
//     .nm_modname = "entry",
//     .nm_priv = ((void *)0),
//     .reserved = {0},
// };
//
// extern "C" __attribute__((constructor)) void RegisterEntryModule(void)
// {
//     napi_module_register(&demoModule);
// }
