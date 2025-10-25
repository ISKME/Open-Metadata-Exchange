import { useState, useRef } from 'react';
import req from 'shared/lib/req';
import { BlockUI, buiStyle } from 'shared/ui/BlockUI/BlockUI';

export function OAImageForm({ lesson, onChange }) {
  const [image, setImage] = useState(lesson.thumbnail);
  const [processing, setProcessing] = useState(false)
  const fileInputRef = useRef(null);

  const uploadImage = (image) => {
    setProcessing(true)
    return req.patch(lesson.edit_url, { image }, true).then(() => {
      setProcessing(false)
    })
  }

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      setImage(URL.createObjectURL(file));
      uploadImage(file)
    }
  };

  const removeImage = () => {
    setImage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      uploadImage('')
    }
  }

  return (
    <div className="lesson-editor-image-ct" style={buiStyle.uiBox}>
      {processing && (<BlockUI text='Saving...'/>)}
      <div className="thumbnail-widget-ct thumbnail-image-widget">
        <div className={`thumbnail-uploaded-image-ct ${image ? '' : 'hidden'}`}>
          <p className="thumbnail-placeholder-text">Title image</p>
          <div className="thumbnail-image-widget-cover">
            <img src={image} />
            <i className="thumbnail-image-widget-cover-spinner fa fa-spinner fa-spin fa-3x fa-fw"></i>
          </div>
          <div className="thumbnail-controls">
            <div className="js-clear">
              <label htmlFor="image-clear_id" className="thumbnail-controls-label js-clear-label" onClick={() => { removeImage(); }}>
                <i className="fa fa-times-circle"></i>
                <p className="thumbnail-controls-text">Remove</p>
                <input type="checkbox" name="image-clear" id="image-clear_id" />
              </label>
              <label htmlFor="id_image" className="thumbnail-controls-label">
                <i className="fa fa-image"></i>
                <p className="thumbnail-controls-text">Change</p>
              </label>
            </div>
          </div>
        </div>

        <div className={`thumbnail-placeholder-ct ${image ? 'hidden' : ''}`}>
          <label htmlFor="id_image" className="thumbnail-placeholder-label">
            <p className="thumbnail-placeholder-text">Add title image</p>
            <div className="thumbnail-placeholder-icons"><i className="fa fa-image"></i></div>
            <p className="thumbnail-placeholder-note">file size limit 10MB</p>
          </label>
        </div>

        <div className="hidden">Currently: <a href="https://microsite-sandbox-prod.s3.amazonaws.com/media/courseware/lesson/image/activity-attributes-of-d-and-d-shapes-out-teach-32_DBYYocd_Lt7Btat.png">courseware/lesson/image/activity-attributes-of-d-and-d-shapes-out-teach-32_DBYYocd_Lt7Btat.png</a>
          <input type="checkbox" name="image-clear" id="image-clear_id" />
          <label htmlFor="image-clear_id">Clear</label><br />
          Change:
          <input type="file" name="image" accept=".png,.jpg,.jpeg,.gif,.svg" id="id_image" onChange={handleImageChange} ref={fileInputRef} />
        </div>

        <div className="controls"></div>
      </div>
    </div>
  )
}
