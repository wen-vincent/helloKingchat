import { hilog } from '@kit.PerformanceAnalysisKit';
import testNapi from 'libkingchat.so';

@Component
export struct MainPage {
  @State message: string = 'Hello Kingchat';

  build() {
    Row() {
      Column() {
        Text(this.message)
          .fontSize(50)
          .fontWeight(FontWeight.Bold)
          .onClick(() => {
            hilog.info(0x0000, 'testTag', 'Test NAPI 2 + 3 = %{public}d', testNapi.add(2, 3));
          })
      }
      .width('100%')
    }
    .height('100%')
  }
}