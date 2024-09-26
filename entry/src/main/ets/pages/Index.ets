import image from '@ohos.multimedia.image';
import abilityAccessCtrl from '@ohos.abilityAccessCtrl';
import router from '@ohos.router';
import { RoomClient, createFromReceiver, Logger, XComponentContext, generateRandomString } from 'kingchat';

const logger: Logger = new Logger('index.ets');

@Entry
@Component
// struct Index {
//   onPageShow(): void {
//   }
//
//   build() {
//     Column() {
//       Row() {
//         Button("open")
//           .width("33%")
//           .height(40)
//           .margin({ bottom: 24, right: 12 })
//           .shadow(ShadowStyle.OUTER_DEFAULT_LG)
//           .onClick(() => {
//             logger.debug('mytest', 'open');
//             router.pushUrl({
//               url: 'pages/helloKingchat'
//             })
//           })
//
//         // Button("close")
//         //   .width("33%")
//         //   .height(40)
//         //   .margin({ bottom: 24, right: 12 })
//         //   .onClick(() => {
//         //     logger.debug('mytest', 'close');
//         //   })
//       }
//       .width('100%')
//       .height('10%')
//       .justifyContent(FlexAlign.Center)
//       .shadow(ShadowStyle.OUTER_DEFAULT_SM)
//       .layoutWeight(1)
//     }
//   }
// }

struct Index {
  private dataSize: image.Size = {
    height: 480,
    width: 640
  };
  private receiver = image.createImageReceiver(this.dataSize, 2000, 8);
  private xComponentContext: XComponentContext | undefined = undefined;
  private XComponentSurfaceId: string = 'localVideo';
  private mXComponentController: XComponentController = new XComponentController;
  private chatClient: RoomClient = new RoomClient({
    roomId: '0099qwe',
    localStream: '',
    displayName: '',
    mode: '2',
    protooUrl: 'wss://kingchat.szkingdom.vip/kingchat/',
    // protooUrl: 'wss://inward.szkingdom.vip/kingchat/',
    videoContentHint: '',
    forceAudioCodec: '',
    audioContentHint: '',
    canvas: '',
    ctx: '',
    canvasArea: ''
  });

  build() {
    Column() {
      Row() {
        XComponent({
          id: this.XComponentSurfaceId,
          type: XComponentType.SURFACE,
          libraryname: '',
          controller: this.mXComponentController
        })
          .width(240)
          .height(320)
          .onLoad(() => {
            // 设置Surface宽高（1920*1080），预览尺寸设置参考前面 previewProfilesArray 获取的当前设备所支持的预览分辨率大小去设置
            // 预览流与录像输出流的分辨率的宽高比要保持一致
            // this.mXComponentController.setXComponentSurfaceSize({ surfaceWidth: 48, surfaceHeight: 64 });
          })
      }
      .width('100%')
      .height('45%')
      .justifyContent(FlexAlign.Center)
      .shadow(ShadowStyle.OUTER_DEFAULT_SM)
      .layoutWeight(1)

      Row() {
        XComponent({
          id: generateRandomString(8),
          type: XComponentType.SURFACE,
          libraryname: 'kingchat'
        })
          .onLoad((xComponentContext) => {
            this.xComponentContext = xComponentContext as XComponentContext;
          })
          .width('640px')//  目前固定640px
          .height('480px')
      }
      .height('45%')
      .justifyContent(FlexAlign.Center)
      .shadow(ShadowStyle.OUTER_DEFAULT_SM)
      .layoutWeight(1)

      Row() {
        Button("connect")
          .width("33%")
          .height(40)
          .margin({ bottom: 24, right: 12 })
          .shadow(ShadowStyle.OUTER_DEFAULT_LG)
          .onClick(() => {

            abilityAccessCtrl.createAtManager()
              .requestPermissionsFromUser(getContext(), ['ohos.permission.CAMERA', 'ohos.permission.MICROPHONE'])
              .then(async () => {

                let receiverSurfaceId: string = await this.receiver.getReceivingSurfaceId();
                this.XComponentSurfaceId = this.mXComponentController.getXComponentSurfaceId();


                this.receiver.on('imageArrival', () => {
                  let img: image.Image = createFromReceiver(this.receiver);
                  if (img) {
                    img.release();
                  }
                });
                this.chatClient.on("getRemoteMsg", (message: string) => {
                  logger.debug('message', message);
                });
                this.chatClient.on("otherLeaved", () => {
                  this.chatClient.close();
                  // router.back();
                });
                await this.chatClient.joinRoom(receiverSurfaceId, this.XComponentSurfaceId);
              })
          })
        Button("record")
          .width("33%")
          .height(40)
          .margin({ bottom: 24, right: 12 })
          .onClick(() => {
            logger.warn('mytest', 'record');
            // this.chatClient.startRecord({});
            let fileName =
              "https://pretke.kingwelan.com/file_service/record/2023/08/22/202308220900569972250052.mp3?time=6.365063";
            let needRecord = true;
            this.chatClient.rtp2webrtc({
              fileName,
              needRecord
            });

            // this.chatClient.sendChatMessage({
            //   text: "11111111111111"
            // });
          })

        Button("close")
          .width("33%")
          .height(40)
          .margin({ bottom: 24, right: 12 })
          .onClick(() => {
            logger.warn('mytestclose', 'close');
            this.chatClient.close();
            // router.back();
          })
      }
      .width('100%')
      .height('10%')
      .justifyContent(FlexAlign.Center)
      .shadow(ShadowStyle.OUTER_DEFAULT_SM)
      .layoutWeight(1)
    }
  }
}