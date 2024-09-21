#include "napi/native_api.h"
#include "hilog/log.h"

#include "mediasoupclient.hpp"
#include <arm-linux-ohos/bits/alltypes.h>
#include <multimedia/image_framework/image_mdk.h>
#include <multimedia/image_framework/image_receiver_mdk.h>
#include <malloc.h>
#include "Broadcaster.h"
#include "json.hpp"
// #include "httplib.h"
#include "./utils/utilCallJs.h"
#include "api/scoped_refptr.h"
#include "pc/video_track_source.h"
#include "ohos_capturer_track_source.h"
#include "ohos_camera_capture.h"
#include "ohos_camera.h"
#include <arm-linux-ohos/bits/alltypes.h>
#include <multimedia/image_framework/image_mdk.h>
#include <multimedia/image_framework/image_receiver_mdk.h>
#include <malloc.h>
#include "client/ohos/peer_sample.h"
#include "samples/sample_bitmap.h"
#include "plugin/plugin_manager.h"
Broadcaster broadcaster;
CallbackData *callbackData = nullptr;
// broadcaster.Start(baseUrl, enableAudio, useSimulcast, response, verifySsl);

int CreateConsumeVideo = 0;
int CreateConsumeAudio = 0;
using json = nlohmann::json;
static napi_value Add(napi_env env, napi_callback_info info)
{
    size_t argc = 2;
    napi_value args[2] = {nullptr};

    napi_get_cb_info(env, info, &argc, args , nullptr, nullptr);

    napi_valuetype valuetype0;
    napi_typeof(env, args[0], &valuetype0);

    napi_valuetype valuetype1;
    napi_typeof(env, args[1], &valuetype1);

    double value0;
    napi_get_value_double(env, args[0], &value0);

    double value1;
    napi_get_value_double(env, args[1], &value1);

    napi_value sum;
    napi_create_double(env, value0 + value1, &sum);

    return sum;

}

static napi_value InitCamera(napi_env env, napi_callback_info info) {
    webrtc::ohos::OhosCamera::GetInstance().Init(env, info);
    rtc::scoped_refptr<webrtc::ohos::CapturerTrackSource> ohos_cts = webrtc::ohos::CapturerTrackSource::Create();

    OH_LOG_Print(LOG_APP, LOG_INFO, LOG_DOMAIN, "mytest", "had been try create");
    return nullptr;
}
static napi_value StopCamera(napi_env env, napi_callback_info info) {
    webrtc::ohos::OhosCamera::GetInstance().StopCamera();
    return nullptr;
}

static napi_value InitCameraAndCreatTrack(napi_env env, napi_callback_info info) {
    OH_LOG_Print(LOG_APP, LOG_INFO, LOG_DOMAIN, "mytest", "GetVersion %{public}s\n", "1.0.0");
    webrtc::ohos::OhosCamera::GetInstance().Init(env, info);
//     uint32_t camera_index = webrtc::ohos::OhosCamera::GetInstance().GetCameraIndex();
//     camera_index = 1;
    //     camera_index = camera_index <= 1 ? 1 - camera_index : 0;
//     webrtc::ohos::OhosCamera::GetInstance().SetCameraIndex(camera_index);
//     webrtc::ohos::OhosCamera::GetInstance().InitCamera();
//     webrtc::ohos::OhosCamera::GetInstance().SetCameraIndex(camera_index);
//     webrtc::ohos::OhosCamera::GetInstance().StartCamera();
    //     if (!GetPeerConnect()) {
    //         PeerSamplePostEvent(PEER_EVENT_CONNECT_PEER);
    //     }
    napi_value result;
    napi_create_int32(env, 0, &result);
    return 0;
}

static napi_value CreateFromReceiver(napi_env env, napi_callback_info info) {
    size_t argc = 1;
    napi_value args[1] = {nullptr};
    napi_get_cb_info(env, info, &argc, args, nullptr, nullptr);
    napi_valuetype value_type;
    napi_typeof(env, args[0], &value_type);
    napi_ref reference;
    napi_create_reference(env, args[0], 1, &reference);
    napi_value img_receiver_js;
    napi_get_reference_value(env, reference, &img_receiver_js);

    ImageReceiverNative *img_receiver_c = OH_Image_Receiver_InitImageReceiverNative(env, img_receiver_js);
    napi_value next_image = webrtc::ohos::OhosCamera::GetInstance().GetImageData(env, img_receiver_c);

    int32_t ret = OH_Image_Receiver_Release(img_receiver_c);
    if (ret != 0) {
        OH_LOG_Print(LOG_APP, LOG_INFO, LOG_DOMAIN, "mytest", "OH_Image_Receiver_Release failed");
        return nullptr;
    }
    return next_image;
}

static napi_value CreateConsume(napi_env env, napi_callback_info info) {

    // 获取参数
    size_t argc = 1;
    napi_value args[1] = {nullptr};
    napi_get_cb_info(env, info, &argc, args, nullptr, nullptr);

    size_t result1;
    napi_get_value_string_utf8(env, args[0], nullptr, 0, &result1);
    if (result1 == 0) {
        return nullptr;
    }
    char *test = new char[result1 + 1];
    napi_get_value_string_utf8(env, args[0], test, result1 + 1, &result1);
    OH_LOG_Print(LOG_APP, LOG_INFO, LOG_DOMAIN, "mytest", "CreateConsume %{public}s\n", test);
    OH_LOG_Print(LOG_APP, LOG_INFO, LOG_DOMAIN, "mytest", "CreateConsumeThreadId %{public}d\n",
                 std::this_thread::get_id());
    auto consumeInfo = nlohmann::json::parse(test);
//         broadcaster.createConsumer(consumeInfo);
    if(consumeInfo["kind"] == "video") {
        CreateConsumeVideo = 1;
    }
    if(consumeInfo["kind"] == "video") {
        CreateConsumeAudio = 1;
    }

    std::thread t(&Broadcaster::createConsumer, std::ref(broadcaster), consumeInfo);
    t.detach();

    return nullptr;
}

static napi_value StartThread(napi_env env, napi_callback_info info) {
    SampleBitMap::NapiDrawPattern(env, nullptr);
    return nullptr;
}

static napi_value InitMediasoup(napi_env env, napi_callback_info info) {
    OH_LOG_Print(LOG_APP, LOG_WARN, LOG_DOMAIN, "mytest", "InitMediasoup");
    auto logLevel = mediasoupclient::Logger::LogLevel::LOG_DEBUG;
    mediasoupclient::Logger::SetLogLevel(logLevel);
    mediasoupclient::Logger::SetDefaultHandler();

    // Initilize mediasoupclient.
    mediasoupclient::Initialize();
    napi_value result;

    utilCallJs *calljs = new utilCallJs;
    calljs->loadJs(env, info);
    broadcaster.getProduceId = calljs;

    napi_create_int64(env, 1, &result);
    return result;
}

// static napi_value GetMediasoupDevice(napi_env env, napi_callback_info info) {
//     OH_LOG_Print(LOG_APP, LOG_INFO, LOG_DOMAIN, "mytest", "GetMediasoupDevice\n");
//
//     // 获取参数
//     size_t argc = 1;
//     napi_value args[1] = {nullptr};
//     napi_get_cb_info(env, info, &argc, args, nullptr, nullptr);
//
//     size_t result1;
//     napi_get_value_string_utf8(env, args[0], nullptr, 0, &result1);
//     if (result1 == 0) {
//         return nullptr;
//     }
//     char *test = new char[result1 + 1];
//     napi_get_value_string_utf8(env, args[0], test, result1 + 1, &result1);
//
//     auto routerRtpCapabilities = nlohmann::json::parse(test);
//
//     const nlohmann::json roomRtpCapabilities = broadcaster.Start(true, false, routerRtpCapabilities);
//
//     OH_LOG_Print(LOG_APP, LOG_INFO, LOG_DOMAIN, "mytest", "GetMediasoupDevice %{public}s \n",
//                  roomRtpCapabilities.dump().c_str());
//
//     napi_value result;
//     napi_create_string_utf8(env, roomRtpCapabilities.dump().c_str(), roomRtpCapabilities.dump().length(), &result);
//     return result;
// }

static napi_value GetMediasoupDevice(napi_env env, napi_callback_info info) {
    OH_LOG_Print(LOG_APP, LOG_INFO, LOG_DOMAIN, "mytest", "GetMediasoupDevice\n");

    // 获取参数
    size_t argc = 1;
    napi_value args[1] = {nullptr};
    napi_get_cb_info(env, info, &argc, args, nullptr, nullptr);

    size_t result1;
    napi_get_value_string_utf8(env, args[0], nullptr, 0, &result1);
    if (result1 == 0) {
        return nullptr;
    }
    char *test = new char[result1 + 1];
    napi_get_value_string_utf8(env, args[0], test, result1 + 1, &result1);

    auto routerRtpCapabilities = nlohmann::json::parse(test);

    auto localRtpCapabilities = broadcaster.Start(true, false, routerRtpCapabilities);

    napi_value result;
    napi_create_string_utf8(env, localRtpCapabilities.dump().c_str(), NAPI_AUTO_LENGTH, &result);
    return result;
}

static napi_value ConnectMediastream(napi_env env, napi_callback_info info) {
    OH_LOG_Print(LOG_APP, LOG_INFO, LOG_DOMAIN, "mytest", "GetMediasoupDevice %{public}u\n",
                 std::this_thread::get_id());

    // 获取参数
    size_t argc = 1;
    napi_value args[1] = {nullptr};
    napi_get_cb_info(env, info, &argc, args, nullptr, nullptr);

    size_t result1;
    napi_get_value_string_utf8(env, args[0], nullptr, 0, &result1);
    if (result1 == 0) {
        return nullptr;
    }
    char *test = new char[result1 + 1];
    napi_get_value_string_utf8(env, args[0], test, result1 + 1, &result1);

    nlohmann::json routerRtpCapabilities = nlohmann::json::parse(test);

    std::thread t(&Broadcaster::CreateTransport, std::ref(broadcaster), routerRtpCapabilities);
    t.detach();
    napi_value result;
    napi_create_int64(env, 1, &result);
    return result;
}

static napi_value GetVersion(napi_env env, napi_callback_info info) {
    OH_LOG_Print(LOG_APP, LOG_INFO, LOG_DOMAIN, "mytest", "GetVersion %{public}s\n", "1.0.0");
        webrtc::ohos::OhosCamera::GetInstance().Init(env, info);
//     uint32_t camera_index = webrtc::ohos::OhosCamera::GetInstance().GetCameraIndex();
//     camera_index = 1;
//     //     camera_index = camera_index <= 1 ? 1 - camera_index : 0;
//     webrtc::ohos::OhosCamera::GetInstance().SetCameraIndex(camera_index);
//     webrtc::ohos::OhosCamera::GetInstance().InitCamera();
//     webrtc::ohos::OhosCamera::GetInstance().SetCameraIndex(camera_index);
//     webrtc::ohos::OhosCamera::GetInstance().StartCamera();
    //     if (!GetPeerConnect()) {
    //         PeerSamplePostEvent(PEER_EVENT_CONNECT_PEER);
    //     }
    napi_value result;
    napi_create_int32(env, 1, &result);
    return 0;
}

static napi_value GetSctpCapabilities(napi_env env, napi_callback_info info) {
    OH_LOG_Print(LOG_APP, LOG_INFO, LOG_DOMAIN, "mytest", "GetSctpCapabilities \n");
    auto sctpCapabilities = broadcaster.getSctpCapabilities();

    napi_value result;
    napi_create_string_utf8(env, sctpCapabilities.dump().c_str(), NAPI_AUTO_LENGTH, &result);
    return result;
}

static napi_value Close(napi_env env, napi_callback_info info) {
    //     CameraRelease();
    webrtc::ohos::OhosCamera::GetInstance().CameraRelease();
    broadcaster.Stop();
     CreateConsumeVideo = 0;
 CreateConsumeAudio = 0;
    
    return 0;
}

EXTERN_C_START
static napi_value Init(napi_env env, napi_value exports)
{
    OH_LOG_Print(LOG_APP, LOG_WARN, LOG_DOMAIN, "mytest", "NAPIInit");
    if(!callbackData)
        callbackData = new CallbackData();
    PluginManager::GetInstance()->Export(env, exports);

    napi_property_descriptor desc[] = {
        { "add", nullptr, Add, nullptr, nullptr, nullptr, napi_default, nullptr },
        {"getMediasoupDevice", nullptr, GetMediasoupDevice, nullptr, nullptr, nullptr, napi_default, nullptr},
        {"initMediasoup", nullptr, InitMediasoup, nullptr, nullptr, nullptr, napi_default, callbackData},
        {"connectMediastream", nullptr, ConnectMediastream, nullptr, nullptr, nullptr, napi_default, nullptr},
        {"initCameraAndCreatTrack", nullptr, InitCameraAndCreatTrack, nullptr, nullptr, nullptr, napi_default, nullptr},
        {"createFromReceiver", nullptr, CreateFromReceiver, nullptr, nullptr, nullptr, napi_default, nullptr},
        {"createConsume", nullptr, CreateConsume, nullptr, nullptr, nullptr, napi_default, nullptr},
        {"startThread", nullptr, StartThread, nullptr, nullptr, nullptr, napi_default, nullptr},
        {"close", nullptr, Close, nullptr, nullptr, nullptr, napi_default, nullptr},
        {"getVersion", nullptr, GetVersion, nullptr, nullptr, nullptr, napi_default, nullptr},
        {"getSctpCapabilities", nullptr, GetSctpCapabilities, nullptr, nullptr, nullptr, napi_default, nullptr},
    };
    napi_define_properties(env, exports, sizeof(desc) / sizeof(desc[0]), desc);
    return exports;
}
EXTERN_C_END

static napi_module demoModule = {
    .nm_version = 1,
    .nm_flags = 0,
    .nm_filename = nullptr,
    .nm_register_func = Init,
    .nm_modname = "kingchat",
    .nm_priv = ((void*)0),
    .reserved = { 0 },
};

extern "C" __attribute__((constructor)) void RegisterKingchatModule(void)
{
    napi_module_register(&demoModule);
}
