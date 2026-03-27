// @ts-ignore
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable consistent-return */
// @ts-nocheck
import { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Close from '@mui/icons-material/Close';
import cls from './style.module.scss';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export const Uploader = ({ text, sx = {}, init = '', onChange = (file) => {}, inputRef, dataImage }) => {
  const [selectedFile, setSelectedFile] = useState();
  const [preview, setPreview] = useState();

  // create a preview as a side effect, whenever selected file is changed
  useEffect(() => {
    if (!selectedFile) {
      setPreview(undefined);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
    // free memory when ever this component is unmounted
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile, init]);
  useEffect(() => {
    if (init) setPreview(init);
  }, []);
  useEffect(() => {
    if (init) setPreview(init);
  }, [init]);

  const onSelectFile = (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(undefined);
      onChange(undefined)
      return;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
      setPreview(e.target.result)
    };

    reader.readAsDataURL(e.target.files[0]); // Convert file to data URL

    // I've kept this example simple by using the first image instead of multiple
    setSelectedFile(e.target.files[0]);
    onChange(e.target.files[0])
  };

  return (
    <div>
      {preview && (
        <div className={cls.container}>
          <img src={preview} alt="" className={cls.preview} width={210} />
          <Close
            className={cls.close}
            onClick={() => {
              if (selectedFile) {
                if (inputRef.current) {
                  inputRef.current.value = "";
                }
                setPreview(dataImage.current);
                onChange(dataImage.current);
              } else {
                setPreview("");
                onChange(null);
              }
              setSelectedFile(null);
            }}
          />
        </div>
      )}
      <Button
        component="label"
        role={undefined}
        variant="contained"
        tabIndex={-1}
        startIcon={<CloudUploadIcon />}
        sx={sx}
      >
        {text}
        <VisuallyHiddenInput
          type="file"
          accept="image/*"
          onChange={onSelectFile}
          ref={inputRef}
        />
      </Button>
      {/* <input type="file" onChange={onSelectFile} /> */}
    </div>
  );
};
