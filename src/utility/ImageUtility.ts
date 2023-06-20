import ScenePlugin = Phaser.Scenes.ScenePlugin
import Image = Phaser.GameObjects.Image

export default class ImageUtility {
  static spaceOutImagesEvenlyHorizontally(images: Image[], scene: ScenePlugin) {
    for (let i: number = 0; i < images.length; i += 1) {
      images[i].setX(
        (Number(scene.manager.game.config.width).valueOf() * (i + 1)) / (images.length + 1),
      )
    }
  }
}
