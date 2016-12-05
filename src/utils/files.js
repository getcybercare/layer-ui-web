import ImageManager from 'blueimp-load-image/js/load-image';
import 'blueimp-load-image/js/load-image-orientation';
import 'blueimp-load-image/js/load-image-meta';
import 'blueimp-load-image/js/load-image-exif';
import layerUI, { layer as LayerAPI, settings as UISettings } from '../base';
import normalizeSize from './sizing';

(function() {
  const Files = layerUI.files = {};
  window.loadImage = ImageManager;

  /**
   * This is a utility class which you can use to watch for user dragging and dropping
   * files from their file system into your app as part of a "Send Attached Message" action.
   *
   * ```
   * var dropWatcher = new layerUI.files.DragAndDropFileWatcher({
   *   node: dropBoxNode,
   *   callback: sendAttachment,
   *   allowDocumentDrop: false
   * });
   * function sendAttachment(messageParts) {
   *    currentConversation.createMessage({ parts: messageParts }).send();
   * }
   * ```
   *
   * @class layerUI.utils.files.DragAndDropFileWatcher
   * @param {Object} options
   * @param {HTMLElement|String} options.node - The dom node (or dom node ID) to watch for files/file-drag events
   * @param {Function} options.callback - The function to call when a file is dropped
   * @param {layer.MessagePart[]} options.callback.parts - The MessageParts representing the dropped files, which you can modify and send.
   * @param {Boolean} [options.allowDocumentDrop=false] - By default, this utility adds an event handler to prevent the browser from navigating away from your
   *         app to view a file dropped in some other part of your app. If you need to handle this event yourself, set this to true.
   */
  Files.DragAndDropFileWatcher = function DragAndDropFileWatcher(options) {
    this.node = typeof options.node === 'string' ? document.getElementById(options.node) : options.node;
    this.callback = options.callback;
    this.allowDocumentDrop = Boolean(options.allowDocumentDrop);

    this.onDragOverBound = this.onDragOver.bind(this);
    this.onDragEndBound = this.onDragEnd.bind(this);
    this.onFileDropBound = this.onFileDrop.bind(this);
    this.ignoreDropBound = this.ignoreDrop.bind(this);

    // Tells the browser that we *can* drop on this target
    this.node.addEventListener('dragover', this.onDragOverBound, false);
    this.node.addEventListener('dragenter', this.onDragOverBound, false);

    this.node.addEventListener('dragend', this.onDragEndBound, false);
    this.node.addEventListener('dragleave', this.onDragEndBound, false);

    this.node.addEventListener('drop', this.onFileDropBound, false);

    if (!this.allowDocumentDrop) {
      document.addEventListener('drop', this.ignoreDropBound, false);
      document.addEventListener('dragenter', this.ignoreDropBound, false);
      document.addEventListener('dragover', this.ignoreDropBound, false);
    }
  };


  /**
   * Destroy this component, in particular, remove any handling of any events.
   *
   * @method
   */
  Files.DragAndDropFileWatcher.prototype.destroy = function() {
    this.node.removeEventListener('dragover', this.onDragOverBound, false);
    this.node.removeEventListener('dragenter', this.onDragOverBound, false);

    this.node.removeEventListener('dragend', this.onDragEndBound, false);
    this.node.removeEventListener('dragleave', this.onDragEndBound, false);

    this.node.removeEventListener('drop', this.onFileDropBound, false);

    if (!this.allowDocumentDrop) {
      document.removeEventListener('drop', this.ignoreDropBound, false);
      document.removeEventListener('dragenter', this.ignoreDropBound, false);
      document.removeEventListener('dragover', this.ignoreDropBound, false);
    }
    delete this.node;
    delete this.callback;
  };

  /**
   * Whatever it is that the browser wants to do by default with this file,
   * prevent it.  Why? Well, one of the more annoying thing it may do
   * is navigate away from your app to show this file.
   *
   * @method
   * @private
   */
  Files.DragAndDropFileWatcher.prototype.ignoreDrop = (evt) => {
    if (evt.preventDefault) {
      evt.preventDefault();
      evt.stopPropagation();
    }
    return false;
  };

  /**
   * On hovering with a file, add a css class
   *
   * @method
   * @private
   */
  Files.DragAndDropFileWatcher.prototype.onDragOver = (evt) => {
    this.node.classList.add('layer-file-drag-and-drop-hover');
    evt.preventDefault();
    return false;
  };

  /**
   * On un-hovering with a file, removea css class
   *
   * @method
   * @private
   */
  Files.DragAndDropFileWatcher.prototype.onDragEnd = (evt) => {
    this.node.classList.remove('layer-file-drag-and-drop-hover');
  };


  /**
   * On file drop, generate an array of Message Parts and pass it on to app.
   *
   * @method
   * @private
   */
  Files.DragAndDropFileWatcher.prototype.onFileDrop = (evt) => {
    this.onDragEnd();

    // stops the browser from redirecting off to the image.
    if (evt.preventDefault) {
      evt.preventDefault();
      evt.stopPropagation();
    }

    const dt = evt.dataTransfer;
    const parts = Array.prototype.map.call(dt.files, file => new LayerAPI.MessagePart(file));

    Files.processAttachments(parts, this.callback);
    return false;
  };

  /**
   * Adds data to your message.
   *
   * Given an array of Message Parts, determines if it needs to generate image or video
   * previews and metadata message parts before calling your callback.
   *
   * @method processAttachments
   * @param {layer.MessagePart[]} parts    Input MessagParts, presumably an array of one element
   * @param {Function} callback            Callback on completion; may be called synchronously
   * @param {layer.MessagePart[]} callback.parts  The MessageParts to send in your Message
   */
  Files.processAttachments = (parts, callback) => {
    // TODO: Need a way to register additional handlers; currently relies on the callback for additional handling.
    parts.forEach((part) => {
      if (['image/gif', 'image/png', 'image/jpeg'].indexOf(part.mimeType) !== -1) {
        Files.generateImageMessageParts(part, callback);
      } else if (part.mimeType === 'video/mp4') {
        Files.generateVideoMessageParts(part, callback);
      } else if (callback) {
        callback([part]);
      }
    });
  };

  Files.generateImageMessageParts = (part, callback) => {
    // First part is the original image; the rest of the code is for generating the other 2 parts of the 3 part Image
    const parts = [part];
    let orientation = 0;

    // STEP 1: Determine the correct orientation for the image
    ImageManager.parseMetaData(part.body, onParseMetadata);


    function onParseMetadata(data) {
      const options = {
        canvas: true,
      };

      if (data.imageHead && data.exif) {
        orientation = options.orientation = data.exif[0x0112] || orientation;
      }

      // STEP 2: Write the image to a canvas with the specified orientation
      ImageManager(part.body, onWriteImage, options);
    }

    function onWriteImage(srcCanvas) {
      // STEP 3: Scale the image down to Preview Size
      const originalSize = {
        width: srcCanvas.width,
        height: srcCanvas.height,
      };

      const size = normalizeSize(originalSize, UISettings.maxSizes);
      const canvas = document.createElement('canvas');
      canvas.width = size.width;
      canvas.height = size.height;
      const context = canvas.getContext('2d');

      // context.scale(size.width, size.height);
      context.fillStyle = context.strokeStyle = 'white';
      context.fillRect(0, 0, size.width, size.height);
      context.drawImage(srcCanvas, 0, 0, size.width, size.height);

      // STEP 4: Turn the canvas into a jpeg image for our Preview Image
      const binStr = atob(canvas.toDataURL('image/jpeg').split(',')[1]);
      const len = binStr.length;
      const arr = new Uint8Array(len);

      for (let i = 0; i < len; i++) {
        arr[i] = binStr.charCodeAt(i);
      }
      const blob = new Blob([arr], { type: 'image/jpeg' });

      // STEP 5: Create our Preview Message Part
      parts.push(new LayerAPI.MessagePart({
        body: blob,
        mimeType: 'image/jpeg+preview',
      }));

      // STEP 6: Create the Metadata Message Part
      parts.push(new LayerAPI.MessagePart({
        mimeType: 'application/json+imageSize',
        body: JSON.stringify({
          orientation,
          width: originalSize.width,
          height: originalSize.height,
          previewWidth: canvas.width,
          previewHeight: canvas.height,
        }),
      }));
      callback(parts);
    }
  };

  Files.generateVideoMessageParts = (part, callback) => {
    const parts = [part];
    const video = document.createElement('video');

    video.addEventListener('canplay', () => {
      const originalSize = {
        width: video.videoWidth,
        height: video.videoHeight,
      };

      const size = normalizeSize(originalSize, UISettings.maxSizes);

      const canvas = document.createElement('canvas');
      canvas.width = size.width;
      canvas.height = size.height;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const binStr = atob(canvas.toDataURL('image/jpeg').split(',')[1]);
      const len = binStr.length;
      const arr = new Uint8Array(len);

      for (let i = 0; i < len; i++) {
        arr[i] = binStr.charCodeAt(i);
      }

      parts.push(new LayerAPI.MessagePart({
        body: new Blob([arr], { type: 'image/jpeg' }),
        mimeType: 'image/jpeg+preview',
      }));

      parts.push(new LayerAPI.MessagePart({
        mimeType: 'application/json+imageSize',
        body: `{"orientation":0, "width":${originalSize.width}, "height":${originalSize.height}}`,
      }));

      callback(parts);
    });

    video.src = URL.createObjectURL(part.body);
  };
})();