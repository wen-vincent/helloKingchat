# the minimum version of CMake.
cmake_minimum_required(VERSION 3.5.0)
project(myNpmLib)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_FLAGS -fno-rtti )

set(NATIVERENDER_ROOT_PATH ${CMAKE_CURRENT_SOURCE_DIR})
set(WEBRTC_PATH ${CMAKE_CURRENT_SOURCE_DIR}/3rd/include)
set(WEBRTC_LIB_PATH ${CMAKE_CURRENT_SOURCE_DIR}/3rd/libs)
set(WEBRTC_ADAPTER ${CMAKE_CURRENT_SOURCE_DIR}/webRTC_adapter)

if(DEFINED PACKAGE_FIND_FILE)
    include(${PACKAGE_FIND_FILE})
endif()

include_directories(${NATIVERENDER_ROOT_PATH}
                    ${NATIVERENDER_ROOT_PATH}/include)

set(CLIENT_SOURCE client/conductor.cc
                  client/defaults.cc
                  client/peer_connection_client.cc
                  client/ohos/peer_sample.cc
                  client/ohos/main_wnd.cc)

add_library(kingchat SHARED napi_init.cpp Broadcaster.cpp MediaStreamTrackFactory.cpp utils/utilCallJs.cpp samples/sample_bitmap.cpp plugin/plugin_manager.cpp
                        ${WEBRTC_ADAPTER}/ohos_camera.cpp
                        ${WEBRTC_ADAPTER}/ohos_codec_data.cpp
                        ${WEBRTC_ADAPTER}/ohos_video_encoder.cpp
                        ${WEBRTC_ADAPTER}/ohos_camera_capture.cpp
                        ${WEBRTC_ADAPTER}/ohos_capturer_track_source.cpp
                        ${CLIENT_SOURCE})

find_library(
    # Sets the name of the path variable.
    hilog-lib
    # Specifies the name of the NDK library that
    # you want CMake to locate.
    hilog_ndk.z
)

target_link_libraries(kingchat PUBLIC ${hilog-lib})
target_link_libraries(kingchat PUBLIC libace_napi.z.so)
target_link_libraries(kingchat PUBLIC libace_ndk.z.so)
target_link_libraries(kingchat PUBLIC libnative_window.so libnative_drawing.so)
target_link_libraries(kingchat PUBLIC libace_napi.z.so libhilog_ndk.z.so libohaudio.so libohcamera.so libimage_ndk.z.so libimage_receiver_ndk.z.so libnative_image.so libnative_media_core.so libnative_media_venc.so libnative_media_codecbase.so)
target_link_libraries(kingchat PUBLIC ${WEBRTC_LIB_PATH}/libmediasoupclient.a)
target_link_libraries(kingchat PUBLIC ${WEBRTC_LIB_PATH}/libsdptransform.a)
target_link_libraries(kingchat PUBLIC ${WEBRTC_LIB_PATH}/libwebrtc.a)
#target_link_libraries(kingchat PUBLIC ${WEBRTC_LIB_PATH}/libmy_sum.so)
#target_link_libraries(kingchat PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}../../../../libs/${OHOS_ARCH}/libffmpeg.so)

target_compile_definitions(kingchat PUBLIC -DWEBRTC_POSIX)

target_include_directories(kingchat PUBLIC ${WEBRTC_ADAPTER}/)
target_include_directories(kingchat PUBLIC ${WEBRTC_PATH}/mediasoup/)
target_include_directories(kingchat PUBLIC ${WEBRTC_PATH}/ohos_webrtc/)
target_include_directories(kingchat PUBLIC ${WEBRTC_PATH}/ohos_webrtc/third_party/abseil-cpp)
target_include_directories(kingchat PUBLIC ${WEBRTC_PATH}/ohos_webrtc/third_party/boringssl)
target_include_directories(kingchat PUBLIC ${WEBRTC_PATH}/ohos_webrtc/third_party/catapult)
target_include_directories(kingchat PUBLIC ${WEBRTC_PATH}/ohos_webrtc/third_party/crc32c)
target_include_directories(kingchat PUBLIC ${WEBRTC_PATH}/ohos_webrtc/third_party/dav1d)
target_include_directories(kingchat PUBLIC ${WEBRTC_PATH}/ohos_webrtc/third_party/ffmpeg)
target_include_directories(kingchat PUBLIC ${WEBRTC_PATH}/ohos_webrtc/third_party/fontconfig)
target_include_directories(kingchat PUBLIC ${WEBRTC_PATH}/ohos_webrtc/third_party/fuzztest)
target_include_directories(kingchat PUBLIC ${WEBRTC_PATH}/ohos_webrtc/third_party/google_benchmark)
target_include_directories(kingchat PUBLIC ${WEBRTC_PATH}/ohos_webrtc/third_party/googletest)
target_include_directories(kingchat PUBLIC ${WEBRTC_PATH}/ohos_webrtc/third_party/harfbuzz-ng)
target_include_directories(kingchat PUBLIC ${WEBRTC_PATH}/ohos_webrtc/third_party/icu)
target_include_directories(kingchat PUBLIC ${WEBRTC_PATH}/ohos_webrtc/third_party/jsoncpp)
target_include_directories(kingchat PUBLIC ${WEBRTC_PATH}/ohos_webrtc/third_party/libaom)
target_include_directories(kingchat PUBLIC ${WEBRTC_PATH}/ohos_webrtc/third_party/catapult)
target_include_directories(kingchat PUBLIC ${WEBRTC_PATH}/ohos_webrtc/third_party/libc++)
target_include_directories(kingchat PUBLIC ${WEBRTC_PATH}/ohos_webrtc/third_party/libc++abi)
target_include_directories(kingchat PUBLIC ${WEBRTC_PATH}/ohos_webrtc/third_party/libevent)
target_include_directories(kingchat PUBLIC ${WEBRTC_PATH}/ohos_webrtc/third_party/libjpeg_turbo)
target_include_directories(kingchat PUBLIC ${WEBRTC_PATH}/ohos_webrtc/third_party/libpng)
target_include_directories(kingchat PUBLIC ${WEBRTC_PATH}/ohos_webrtc/third_party/libsrtp)
target_include_directories(kingchat PUBLIC ${WEBRTC_PATH}/ohos_webrtc/third_party/libvpx)
target_include_directories(kingchat PUBLIC ${WEBRTC_PATH}/ohos_webrtc/third_party/libyuv/include)
target_include_directories(kingchat PUBLIC ${WEBRTC_PATH}/ohos_webrtc/third_party/llvm-build)
target_include_directories(kingchat PUBLIC ${WEBRTC_PATH}/ohos_webrtc/third_party/nasm)
target_include_directories(kingchat PUBLIC ${WEBRTC_PATH}/ohos_webrtc/third_party/openh264)
target_include_directories(kingchat PUBLIC ${WEBRTC_PATH}/ohos_webrtc/third_party/opus)
target_include_directories(kingchat PUBLIC ${WEBRTC_PATH}/ohos_webrtc/third_party/pffft)
target_include_directories(kingchat PUBLIC ${WEBRTC_PATH}/ohos_webrtc/third_party/protobuf)
target_include_directories(kingchat PUBLIC ${WEBRTC_PATH}/ohos_webrtc/third_party/re2)
target_include_directories(kingchat PUBLIC ${WEBRTC_PATH}/ohos_webrtc/third_party/rnnoise)
target_include_directories(kingchat PUBLIC ${WEBRTC_PATH}/ohos_webrtc/third_party/zlib)
target_include_directories(kingchat PUBLIC ${WEBRTC_PATH}/ohos_webrtc/third_party/jsoncpp/source/include)