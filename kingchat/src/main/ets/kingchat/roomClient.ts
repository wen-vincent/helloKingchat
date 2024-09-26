import { Logger } from '../utils/Logger'
import { generateRandomString, generateRandomNumber, deviceInfo } from '../utils/Utils'
import WebSocketTransport from '../protooClient/transports/WebSocketTransport'
import Peer from '../protooClient/Peer'
import { EventEmitter } from '../polyfill/events';
import kingchat from 'libkingchat.so';
import {
  PC_PROPRIETARY_CONSTRAINTS,
  TRANSPORT_DIRECTION,
  VIDEO_MODE,
  MEDIA_SEND_STATE,
  MEDIA_IDENTITY
} from '../utils/define';
import { map } from '@kit.MapKit'


// export function kingchat.createFromReceiver;
export function createFromReceiver(receiver) {
  return kingchat.createFromReceiver(receiver);
}

const logger = new Logger('RoomClient');

export interface RoomInfo {
  roomId: string,
  localStream: string,
  displayName: string,
  mode: string,
  protooUrl: string,
  videoContentHint: string,
  forceAudioCodec: string,
  audioContentHint: string,
  canvas: string,
  ctx: string,
  canvasArea: string
}

export class RoomClient extends EventEmitter {
  public on: Function;
  private _device;
  private _peerId;
  private _closed;
  private _roomId: String = '';
  private _displayName;
  private _videoMode;
  private _produced;
  private _consume;
  private _useDataChannel;
  private _canUseDataChannel;
  private _videoContentHint;
  private _audioContentHint;
  private _forceAudioCodec;
  private canvas;
  private ctx;
  private drawdown;
  private startPointX;
  private startPointY;
  private toolcontrol;
  private convasData;
  private drawcolor;
  private curtool;
  private textvalue;
  private canvasArea;
  private shareDesktopWidth;
  private shareDesktopHeight;
  private widthRatio;
  private heeightRatio;
  private _produce;
  private _fileServiceUrl;
  private _protooUrl;
  private _protoo;
  private _mediasoupDevice;
  private _sendTransport;
  private _recvTransport;
  private _micProducer;
  private _webcamProducer;
  private _recordVideoProducer;
  private _recordAudioProducer;
  private _shareProducer;
  private _chatDataProducer;
  private _consumers;
  private _dataConsumers;
  private _localStream;
  private _remoteStream;
  private _shareDesktopStream;
  private _recordMixer;
  private _protooTransport;
  private _videoCodecOptions;
  private _getBitrateInterval;
  private _trackMp3;
  private _lastBytesRecv;
  private _lastBytesSent;
  private _lastRecordBytesSent;
  private _lastPackets;
  private _recordedChunks;
  private _mediaRecorder;
  private _stopRecord;
  private _recordMixedStream;
  public emit;

  constructor({
    roomId,
    localStream,
    displayName,
    mode,
    protooUrl,
    videoContentHint,
    forceAudioCodec,
    audioContentHint,
    canvas,
    ctx,
    canvasArea
  }: RoomInfo) {
    super();
    // 设备标识标识
    this._device = deviceInfo();
    logger.warn('this._device', JSON.stringify(this._device));

    const peerId = generateRandomString({ length: 16 });
    this._peerId = peerId;

    // Closed flag.
    // @type {Boolean}
    this._closed = false;

    // Room num
    // @type {String}
    this._roomId = roomId ? roomId : generateRandomString({ length: 8 });

    // Display name.
    // @type {String}
    this._displayName = displayName ? displayName : generateRandomString({ length: 8 });

    // video mode
    // @type {VIDEO_MODE}
    this._videoMode = Number(mode);

    // 由于双向视频,是在对方加入房间后推流,对于多次加入房间要对推流状态进行判断
    // @type {Boolean}
    // TODO: 由于新需求需要多次推不同的流,不该在这里做全局判断
    this._produced = false;

    // Whether we should consume.
    // @type {Boolean}
    this._consume = true;

    // Whether we want DataChannels.
    // @type {Boolean}
    this._useDataChannel = true;

    // Whether we want DataChannels.
    // @type {Boolean}
    this._canUseDataChannel = false;

    this._videoContentHint = videoContentHint ? videoContentHint : "detail";
    this._audioContentHint = audioContentHint ? audioContentHint : "";

    this._forceAudioCodec = forceAudioCodec ? forceAudioCodec : "audio/opus";

    this.canvas = canvas;
    this.ctx = ctx;
    this.drawdown = false;
    this.startPointX;
    this.startPointY;
    this.toolcontrol = {
      pencil: false,
      line: false,
    }
    this.convasData = null;
    this.drawcolor = "#000";
    this.curtool;
    this.textvalue;
    this.canvasArea = canvasArea;
    this.shareDesktopWidth = 0;
    this.shareDesktopHeight = 0;
    this.widthRatio = 0;
    this.heeightRatio = 0;

    switch (this._videoMode) {
      case VIDEO_MODE.SINGLE:
        this._produce = true;
        this._consume = true;
        this._useDataChannel = false;
        break;
      case VIDEO_MODE.TWOWAY:
        this._produce = true;
        this._consume = true;
        this._useDataChannel = false;
        break;
      default:
    // TODO: 抛出异常
    }
    // http://192.168.80.184:3000/fileServicer/upload

    this._fileServiceUrl = 'http' + protooUrl.slice(2) + '/fileServicer/upload';
    logger.debug('FileServiceUrl', this._fileServiceUrl);
    // Protoo URL.
    // @type {String}
    if (protooUrl.slice(-1) != '/') {
      protooUrl += '/';
    }
    this._protooUrl = protooUrl + "?roomId=" + this._roomId + "&peerId=" + peerId + "&videoMode=" + this._videoMode;
    logger.warn('_protooUrl:', this._protooUrl);

    // protoo-client Peer instance.
    // @type {protooClient.Peer}
    this._protoo = undefined;

    // mediasoup-client Device instance.
    // @type {mediasoupClient.Device}
    this._mediasoupDevice = undefined;

    // mediasoup Transport for sending.
    // @type {mediasoupClient.Transport}
    this._sendTransport = undefined;

    // mediasoup Transport for receiving.
    // @type {mediasoupClient.Transport}
    this._recvTransport = undefined;

    // Local mic mediasoup Producer.
    // @type {mediasoupClient.Producer}
    this._micProducer = undefined;

    // Local webcam mediasoup Producer.
    // @type {mediasoupClient.Producer}
    this._webcamProducer = undefined;

    // Local mic mediasoup Producer.
    // @type {mediasoupClient.Producer}
    this._recordVideoProducer = undefined;

    // Local webcam mediasoup Producer.
    // @type {mediasoupClient.Producer}
    this._recordAudioProducer = undefined;

    // Local share mediasoup Producer.
    // @type {mediasoupClient.Producer}
    this._shareProducer = undefined;

    // Local chat DataProducer.
    // @type {mediasoupClient.DataProducer}
    this._chatDataProducer = undefined;

    // mediasoup Consumers.
    // @type {Map<String, mediasoupClient.Consumer>}
    this._consumers = new Map();

    // mediasoup DataConsumers.
    // @type {Map<String, mediasoupClient.DataConsumer>}
    this._dataConsumers = new Map();

    // Local stream
    // @type {Mediastream}
    this._localStream = localStream;

    // Remote stream
    // @type {Mediastream}
    // this._remoteStream = new MediaStream();
    this._remoteStream = undefined;
    this._shareDesktopStream = undefined;

    // Mixed stream
    // @type {Mediastream}
    this._recordMixedStream = undefined;

    // Mixer
    // @type {MultiStreamsMixer}
    this._recordMixer = undefined;

    // Signal transport
    // @type {protooClient.WebSocketTransport}
    this._protooTransport = undefined;

    this._videoCodecOptions = {
      videoGoogleStartBitrate: 0,
      videoGoogleMinBitrate: 0,
      videoGoogleMaxBitrate: 0
    }

    this._getBitrateInterval = null;
    this._trackMp3 = null;

    this._lastBytesRecv = 0;
    this._lastBytesSent = 0;
    this._lastRecordBytesSent = 0;
    this._lastPackets = 0; //调试用

    this._recordedChunks = [[]];
    this._mediaRecorder;
    this._stopRecord = false;
  }

  async _setRtpCapabilities() {

    // TODO:  获取Device信息
    // this._mediasoupDevice = new mediasoupClient.Device();

    // 获取媒体能力
    // routerRtpCapabilities.codecs 服务的能力
    const routerRtpCapabilities =
      await this._protoo.request('getRouterRtpCapabilities');
    // logger.warn('getRouterRtpCapabilities', JSON.stringify(routerRtpCapabilities.headerExtensions));
    {
      // urn:3gpp:video-orientation 字段
      // 会让视频自动旋转
      // 删除之后能得到正确视频,手机旋转之后图像跟着旋转
      // producer中videoorientationchange事件,但是在服务器端拿到方向
      // https://mediasoup.org/documentation/v3/mediasoup/api/

      // 视频模糊和这里无关
      // routerRtpCapabilities.headerExtensions =
      //   routerRtpCapabilities.headerExtensions.filter((ext) => ext.uri !== 'urn:3gpp:video-orientation');
    }

    // this._mediasoupDevice._extendedRtpCapabilities 本地和服务器都支持的编解码器,包含服务器的约束
    // this._mediasoupDevice.rtpCapabilities
    // 如果服务器没有支持的编解码器
    // 1.单向视频修改为默认本地的编解码器,服务器保存该编解码
    // 2.双向视频此处应该为对方能力,但是目前双向视频的码率等设置还在服务上
    // TODO: 加载媒体能力 发送到服务器
    // await this._mediasoupDevice.load({
    //   routerRtpCapabilities
    // });
    //
    // await this._protoo.request(
    //   'setRtpCapabilities', {
    //   rtpCapabilities: this._mediasoupDevice._extendedRtpCapabilities
    // });
    // JSON rtpCapabilities;

    // let callback = (parm:string): Promise<string> => {
    //
    //   logger.warn('get parm',parm);
    //   return new Promise((resolve) => {
    //
    //       resolve("xxxxxxxxxxxxxxxxxxxxxx");
    //
    //   });
    // }

    // const initInfo = kingchat.initMediasoup(async (parm:string): Promise<string> => {
    //   let  jspnParm = JSON.parse(parm);
    //    return new Promise(async  (resolve,reject)=>{
    //      logger.warn('js produce',jspnParm.kind);
    //      await this._protoo.request(
    //        'produce', {
    //        transportId: this._sendTransport.id,
    //        kind:jspnParm.kind,
    //        rtpParameters:jspnParm.rtpParameters,
    //      });
    //      // const {id} = await this._protoo.request(
    //      //   'produce', {
    //      //   transportId: this._sendTransport.id,
    //      //   kind:jspnParm.kind,
    //      //   rtpParameters:jspnParm.rtpParameters,
    //      // }).catch((err)=>{
    //      //   logger.warn('js produce',err);
    //      //   reject(err);
    //      // });
    //      // logger.warn('js produce',id);
    //      // resolve (id);
    //    });
    // });

    logger.debug('getRouterRtpCapabilities', JSON.stringify(routerRtpCapabilities));
    const roomRtpCapabilities = kingchat.getMediasoupDevice(JSON.stringify(routerRtpCapabilities));
    logger.debug('gerRtpCapabilities', roomRtpCapabilities.toString());

    await this._protoo.request(
      'setRtpCapabilities', {
      // rtpCapabilities: {rtpCapabilities:JSON.parse(roomRtpCapabilities.toString())}
      rtpCapabilities: JSON.parse(roomRtpCapabilities.toString())
    });

    const sctpCapabilities = kingchat.getSctpCapabilities();

    const transportInfoProducing =
      await this._protoo.request('createWebRtcTransport', {
        forceTcp: false,
        producing: true,
        consuming: false,
        sctpCapabilities: JSON.parse(sctpCapabilities)
      }).catch((err) => {
        logger.error('获取服务器信息失败', JSON.stringify(err));
      });

    const transportInfoConsuming =
      await this._protoo.request('createWebRtcTransport', {
        forceTcp: false,
        producing: false,
        consuming: true,
        sctpCapabilities: JSON.parse(sctpCapabilities)
      }).catch((err) => {
        logger.error('获取服务器信息失败', JSON.stringify(err));
      });
    let transportInfo = { transportInfoProducing, transportInfoConsuming }
    logger.warn('js get transportInfo: ', JSON.stringify(transportInfo));

    // // wss连接
    await this._protoo.request(
      'join', {
      displayName: "testHarmony",
      device: this._device,
      rtpCapabilities: JSON.parse(roomRtpCapabilities.toString()),
      sctpCapabilities: JSON.parse(sctpCapabilities)
    });

    let callback = (parm: string): Promise<string> => {

      const jspnParm = JSON.parse(parm);

      return new Promise(async (resolve, reject) => {
        if (jspnParm.action === 'produce') {
          let appData = { mediaSendState: 0, mediaIdentity: 0 };
          if (this._videoMode === VIDEO_MODE.SINGLE) {
            appData.mediaSendState = MEDIA_SEND_STATE.SENDONLY;
            appData.mediaIdentity = MEDIA_IDENTITY.RECORD_ONLY;
          } else {
            appData.mediaSendState = MEDIA_SEND_STATE.FORWARD;
            appData.mediaIdentity = MEDIA_IDENTITY.CAMERA;
          }
          await this._protoo.request('produce', {
            transportId: jspnParm.id,
            kind: jspnParm.kind,
            rtpParameters: jspnParm.rtpParameters,
            appData
          }).then(({ id }) => {
            resolve(id);
          }).catch(error => reject(error));
        } else if (jspnParm.action === 'connectWebRtcTransport') {
          logger.warn('calljs connectWebRtcTransport', jspnParm);
          await this._protoo.request('connectWebRtcTransport', {
            transportId: jspnParm.id,
            dtlsParameters: jspnParm.dtlsParameters
          }).then(() => {
            resolve("");
          }).catch(error => reject(error));
        }

      });

    }

    kingchat.initMediasoup(callback);
    kingchat.connectMediastream(JSON.stringify(transportInfo));
  }

  async sendChatMessage({ text }) {
    if (!this._chatDataProducer || !this._canUseDataChannel) {
      logger.warn('信令通道');
      await this._protoo.request('textMsg', {
        consumerId: '',
        textMsg: text
      });
    } else {
      logger.warn('数据通道');
      try {
        this._chatDataProducer.send(text);
      } catch (error) {
        return {
          error: `chat DataProducer.send() failed:${error}`
        };
      }
    }
  }

  async joinRoom(receiverSurfaceId: string, XComponentSurfaceId: string) {
    this._closed = false;
    // kingchat.initCameraAndCreatTrack(receiverSurfaceId, XComponentSurfaceId);
    kingchat.getVersion(receiverSurfaceId, XComponentSurfaceId);

    if (!this._protooTransport) {
      try {
        this._protooTransport = new WebSocketTransport(this._protooUrl, 'protoo');
        this._protooTransport.on('open', () => {
          logger.warn('创建WebSocketTransport成功!', 'onopen');
        });

        this._protooTransport.on('failed', () => {
          logger.error('WebSocketTransport', 'failed!');
        });

        this._protooTransport.on('close', (event) => {
          if (event && event.reason) {
            logger.error('WebSocketTransport closed: %O', event.reason);
            // this.emit('error', event);
          } else {
            logger.warn('WebSocketTransport closed: ', 'normal');
          }
        });

      } catch (error) {
        logger.error('创建protooTransport', 'error');
        this.emit('error', error);
      }
    } else {
      logger.warn('protooTransport 已经创建!', '')
    }

    // this._protoo 多次初始化时候,不会有多个连接
    this._protoo = new Peer(this._protooTransport);
    this._protoo.on('open', async () => {
      logger.warn('创建protoo client成功!', 'onopen');
      this.emit('connected');

      // 获取媒体信息
      await this._setRtpCapabilities();
      // await this._connectMediastream();

      if (this._videoMode === VIDEO_MODE.SINGLE) { // 单向在这里推流
        logger.warn('pushed signal stream');
        let audioTracks = this._localStream.getAudioTracks();
        if (audioTracks.length) {
          // await this._enableRecordAudio(audioTracks[0]);
        } else {
          logger.warn('Can not find audioTracks')
        }
        let videoTracks = this._localStream.getVideoTracks();
        if (videoTracks.length) {
          // await this._enableRecordVideo(videoTracks[0]);
        } else {
          logger.warn('Can not find videoTracks')
        }
      }

    });

    this._protoo.on('failed', () => {
      logger.error("protoo websocket failed !");
    });

    this._protoo.on('disconnected', () => {
      if (this._closed) {
        logger.warn('The connection is down and closed!', 'disconnected');
        return;
      }
      logger.warn('The connection is down !', 'disconnected');
      // this.close();
      // this.emit('closed');

      if (this._sendTransport) {
        this._sendTransport.close();
        this._sendTransport = null;
      }

      if (this._recvTransport) {
        this._recvTransport.close();
        this._recvTransport = null;
      }
      // closeStream(this._remoteStream);
      this._remoteStream = undefined;
      // closeStream(this._shareDesktopStream);
      this._shareDesktopStream = undefined;
    });

    this._protoo.on('close', () => {
      if (this._closed) {
        logger.warn('The connection is down and closed!', 'close');
        return;
      }
      logger.warn('close: The connection is down !', 'close');
      // this.close();
      // this.emit('closed');
    });

    this._protoo.on('request', async (request, accept, reject) => {
      logger.debug('proto "request" event', ` [method:${request.method}, data:${JSON.stringify(request.data)}]`);
      switch (request.method) {
        case 'newConsumer': {
          kingchat.createConsume(JSON.stringify(request.data));
          accept();
          break;
        }
        case 'newDataConsumer': {
          if (!this._consume) {
            reject(403, 'I do not want to data consume');

            break;
          }

          if (!this._useDataChannel) {
            reject(403, 'I do not want DataChannels');

            break;
          }

          const {
            peerId, // NOTE: Null if bot.
            dataProducerId,
            id,
            sctpStreamParameters,
            label,
            protocol,
            appData
          } = request.data;

          try {
            const dataConsumer = await this._recvTransport.consumeData({
              id,
              dataProducerId,
              sctpStreamParameters,
              label,
              protocol,
              appData: {
                ...appData,
                peerId
              } // Trick.
            });

            // Store in the map.
            this._dataConsumers.set(dataConsumer.id, dataConsumer);

            dataConsumer.on('transportclose', () => {
              this._dataConsumers.delete(dataConsumer.id);
              this.emit('textchat', 'close');
            });

            dataConsumer.on('open', () => {
              this.emit('textchat', 'open');
              this._canUseDataChannel = true;
            });

            dataConsumer.on('close', () => {
              this._dataConsumers.delete(dataConsumer.id);
              this.emit('textchat', 'close');
            });

            dataConsumer.on('error', (error) => {
              const errMsg = 'DataConsumer "error" event:%o' + error;
              this.emit('error', errMsg);
            });

            dataConsumer.on('message', (message) => {
              switch (dataConsumer.label) {
                case 'chat': {
                  this.emit('getRemoteMsg', message);
                  break;
                }

                case 'bot': {
                  break;
                }
              }
            });


            // We are ready. Answer the protoo request.
            accept();
          } catch (error) {
            logger.error(error);
            this.emit('error', '"newDataConsumer" request failed!');
          }

          break;
        }
      }
    });

    this._protoo.on('notification', (notification) => {
      // logger.warn(
      // 	'proto "notification" event [method:%s, data:%o]',
      // 	notification.method, notification.data);

      switch (notification.method) {
        case 'getOtherRtpCapabilities': {
          const rtpCapabilities = notification.data;
          logger.warn('getOtherRtpCapabilities', rtpCapabilities);
          break;
        }
        case 'producerScore': {
          const {
            producerId,
            score
          } = notification.data;
          logger.warn('producerId score:', producerId, score);
          this.emit('score', producerId, score);
          break;
        }
        case 'recordError': {
          const {
            peerId,
            error
          } = notification.data;
          logger.error('peerId:%s', peerId, error);
          this.emit('recordError', error);
          break;
        }
        case 'licenseError': {
          const {
            peerId,
            error
          } = notification.data;
          logger.error('peerId:%s', peerId, error);
          break;
        }
        case 'newPeer': {
          const {
            id,
            displayName,
            device,
            rtpCapabilities
          } = notification.data;
          // this._mediasoupDevice.otherRtpCapabilities = rtpCapabilities;
          // logger.warn('otherRtpCapabilities', this._mediasoupDevice.otherRtpCapabilities);
          // logger.warn('id: %s, displayName: %s, device: %o', id, displayName, device);
          // if (this._videoMode === VIDEO_MODE.TWOWAY) { // 双向在这里推流
          //   // this._startProduce(); // TODO: 应该在这里断了之前的视频再推流,而且要验证拿到对方的编码器
          // } else if (this._videoMode === VIDEO_MODE.SINGLE) {
          //   // logger.error('newPeer: single -> newPeer!');
          // } else {
          //   // 扩展位
          // }
          this.emit('otherJoined');
          break;
        }
        case 'textMsg': {
          const {
            consumerId,
            textMsg
          } = notification.data;
          // logger.warn(consumerId, textMsg);
          this.emit('getRemoteMsg', textMsg);
          break;
        }
        case 'drawMsg': {
          const {
            consumerId,
            drawMsg
          } = notification.data;
          // logger.warn(consumerId, textMsg);
          this.emit('getDrawMsg', drawMsg);

          break;
        }
        case 'peerClosed': {
          const {
            peerId
          } = notification.data;
          this.emit('otherLeaved');
          break;
        }

        case 'downlinkBwe': {
          // logger.warn('\'downlinkBwe\' event:%o', notification.data);
          break;
        }

        case 'consumerClosed': {
          const {
            consumerId
          } = notification.data;
          logger.warn('consumerClosed', consumerId);

          const consumer = this._consumers.get(consumerId);

          if (!consumer) {
            break;
          }

          this._remoteStream.removeTrack(consumer.track);
          if (this._shareDesktopStream) {
            this._shareDesktopStream.removeTrack(consumer.track);
          }
          consumer.close();
          this._consumers.delete(consumerId);
          const {
            peerId
          } = consumer.appData;

          break;
        }

        case 'consumerPaused': {
          const {
            consumerId
          } = notification.data;
          const consumer = this._consumers.get(consumerId);

          if (!consumer) {
            break;
          }

          consumer.pause();

          break;
        }

        case 'consumerResumed': {
          const {
            consumerId
          } = notification.data;
          const consumer = this._consumers.get(consumerId);

          if (!consumer) {
            break;
          }

          consumer.resume();

          break;
        }

        case 'consumerLayersChanged': {
          const {
            consumerId,
            spatialLayer,
            temporalLayer
          } = notification.data;
          const consumer = this._consumers.get(consumerId);

          if (!consumer) {
            break;
          }
          break;
        }

        case 'consumerScore': {
          const {
            consumerId,
            score
          } = notification.data;
          logger.warn('consumerScore', score);
          break;
        }

        case 'dataConsumerClosed': {
          const {
            dataConsumerId
          } = notification.data;
          const dataConsumer = this._dataConsumers.get(dataConsumerId);

          if (!dataConsumer) {
            break;
          }

          dataConsumer.close();
          this._dataConsumers.delete(dataConsumerId);

          const {
            peerId
          } = dataConsumer.appData;
          break;
        }

        case 'activeSpeaker': {
          const {
            peerId
          } = notification.data;
          break;
        }
        case 'rtp2webrtcStart': {
          const {
            fileName
          } = notification.data;
          this.emit('rtp2webrtcStart', fileName);
          // logger.warn('开始播报');
          // this.producerCtrl('mic', 'pause');
          break;
        }
        case 'rtp2webrtcEnded': {
          const {
            fileName
          } = notification.data;
          this.emit('rtp2webrtcEnded', fileName);
          // logger.warn('结束播报');
          // this.producerCtrl('mic', 'resume');
          break;
        }
        default: {
          logger.error(
            'unknown protoo notification.method "%s"', notification.method);
        }
      }
    });
  }

  async startRecord({
    upload=true,
    fileService=undefined,
    own=true,
    other=false,
  }) {
    if (!this._protoo) {
      logger.error("There is no websocket connection !");
      return {
        error: "There is no websocket connection !"
      };
    }

    try {
      const res = await this._protoo.request(
        'start-record', {
        videoMode: this._videoMode,
        upload,
        fileService,
        own,
        other,
      });
      return res;
    } catch (error) {
      logger.warn('录制失败', error);
      return error;
    }
  }

  async stopRecord({
    own=true,
    other=false,
    isMixed=undefined,
    timeout=30 * 1000
  }) {
    if (!this._protoo) {
      logger.error("There is no websocket connection !");
      return;
    }
    try {
      const res = await this._protoo.request(
        'stop-record', {
        own,
        other,
        isMixed,
        videoMode: this._videoMode,
        timeout
      });
      return res;
    } catch (error) {
      return error;
    }
  }

  async rtp2webrtc({
    fileName,
    startTime = undefined,
    endTime = undefined,
    toOwn = true,
    toOther = false,
    needRecord,
    loops = false,
    vol = undefined
  }) {
    if (!this._protoo) {
      logger.error("There is no websocket connection !");
      return;
    }

    const res = await this._protoo.request(
      'rtp2webrtc', {
      fileName,
      startTime,
      endTime,
      toOwn,
      toOther,
      needRecord,
      loops,
      vol
    });

    return res;
  }

  async stopRtp2webrtc({toOwn=true}) {
    if (!this._protoo) {
      logger.error("There is no websocket connection !");
      return;
    }

    const res = await this._protoo.request(
      'stopRtp2webrtc', {
      toOwn: true,
      toOther: false
    });
    return res;
  }

  closeStream() {
    kingchat.close()
  }

  close() {
    if (this._closed) {
      logger.warn("mytest", "func close()");
      return;
    }

    this._closed = true;

    // Close mediasoup Transports.
    // if (this._sendTransport) {
    //   this._sendTransport.close();
    // }
    //
    // if (this._recvTransport) {
    //   this._recvTransport.close();
    // }

    // this._disableMic();
    // this._disableWebcam();
    // this._produced = false;

    // Close protoo Peer
    if (this._protoo) {
      this._protoo.close();
      this._protoo = null;
    }

    if (this._protooTransport) {
      this._protooTransport.close();
      this._protooTransport = null;
    }

    this.closeStream();
  }
}
