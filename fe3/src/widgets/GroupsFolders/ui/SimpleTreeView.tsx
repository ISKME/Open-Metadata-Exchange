/* eslint-disable react/prop-types */
/* eslint-disable max-len */
/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/anchor-is-valid */
// @ts-nocheck
import * as React from "react";
import cls from "./GroupsFolders.module.scss";
import CloseFolderSvg from "./../../../app/image/closeFolder.svg";
import OpenFolderSvg from "./../../../app/image/openFolder.svg";
import ThreePointSvg from "./../../../app/image/threePoint.svg";

export function SimpleTreeView({ 
  folders,
  groupId,
  setId,
  setName,
  setOpenRename,
  setOpen,
  subfolderCallback,
  openAddSubfolderCallback,
  setDefaultPage,
  setFolderId,
  getSelectedItem,
  setSubFolderId,
  title = 'All Cases',
}) {
  const [selectedFolder, setSelectedFolder] = React.useState(null);
  const [subSelected, setSubSelected] = React.useState(null);

  const handleFolderClick = (id, is_default) => {
    setSelectedFolder((prev) => (prev === id ? null : id));
    setSubSelected(null);
    getSelectedItem(is_default)
  };

  const handleSubfolderClick = (id) => {
    setSubSelected((prev) => (prev === id ? null : id)); 
  };

  const handleDelete = (id, isSubfolder) => {
    setId(id);
    setOpen(true);
    subfolderCallback(isSubfolder);
  };
  
  const handleRename = (id, title, isSubfolder) => {
    setId(id);
    setName(title);
    setOpenRename(true);
    subfolderCallback(isSubfolder);
  };

  const handleAddSubfolder = (id, isGroup=false) => {
    setId(id);
    openAddSubfolderCallback(true, isGroup);
  };

  React.useEffect(()=>{
    setDefaultPage(1)
    const params = new URLSearchParams(window.location.search);
    params.set("page", 1);
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
    setFolderId(selectedFolder)
    setSubFolderId(subSelected)
  },[selectedFolder,subSelected])

  return (
    <div>
      <div className={cls.foldersHeader}>
          <div className={cls.foldersTitle}>Folders</div>
          <div onClick={() => handleAddSubfolder(groupId, true)} className={cls.primary}>+ New Folder</div>
      </div>
      <div
        onClick={() => {
          setSelectedFolder(null);
          setSubSelected(null);
        }}
        style={{ cursor: 'pointer' }}
      >
        <span>{title}</span>
      </div>
      <div className={cls.folders}>
        {folders.map((folder) => (
          <div
            key={folder.id}
            className={cls.foldersItem}
            onClick={() => handleFolderClick(folder.id, folder.is_default)}
          >
            <div
              className={`${cls.foldersItem1} ${folder.id === selectedFolder && !subSelected ? cls.selected : 
                folder.id === selectedFolder && subSelected ? cls.noSelected : ''
              }`}
            >
              <div className={`${cls.foldersItem2} ${folder.subfolders && folder.subfolders.length > 0 ? '' : cls.arrowSpace}`} >
                {folder.subfolders && folder.subfolders.length > 0 && (
                  <span>
                    {folder.id !== selectedFolder ? (
                      <span style={{fontSize: "20px", fontWeight: 600}}>›</span>
                    ) : (
                      <span style={{ display: "inline-block", transform: "rotate(90deg)", fontSize: "20px", fontWeight: 600 }}>›</span>
                    )}
                  </span>
                )}
                 
                {folder.id !== selectedFolder ? (
                  <CloseFolderSvg />
                ) : (
                  <OpenFolderSvg />
                )}
                <span className={cls.folderSpan}>{folder.title} ({folder.items_count ?? 0})</span>
              </div>
              <div className={cls.svgWrapper}>
                <ThreePointSvg className={cls.svg} />
                <div className={cls.dropdown}>
                  <div onClick={() => handleAddSubfolder(folder.id)}>Add Subfolder</div>
                  {
                    !folder.is_default &&  <div onClick={() => handleDelete(folder.id, false)}>Delete</div>
                  }
                  {
                    !folder.is_default &&  <div onClick={() => handleRename(folder.id, folder.title, false)}>Rename</div>
                  }
                </div>
              </div>
            </div>

            {selectedFolder === folder.id && (
              <div>
                {folder.subfolders.map((subfolder) => (
                  <div key={subfolder.id} className={`${cls.foldersItem} ${cls.subFolders}`} onClick={(e) => { e.stopPropagation(); handleSubfolderClick(subfolder.id); }}>
                    <div className={`${cls.foldersItem1} ${subfolder.id === subSelected ? cls.selected : ''}`}>
                    <div className={cls.foldersItem2}>
                      {subfolder.id !== subSelected ? (
                      <CloseFolderSvg />
                      ) : (
                      <OpenFolderSvg />
                      )}
                      <span className={cls.folderSpan}>{subfolder.title} ({subfolder.items_count ?? 0})</span>
                    </div>
                    <div className={cls.svgWrapper}>
                      <ThreePointSvg className={cls.svg} />
                      <div className={cls.dropdown}>
                      <div onClick={() => handleRename(`${folder.id}_${subfolder.id}`, subfolder.title, true)}>Rename</div>
                      <div onClick={() => handleDelete(`${folder.id}_${subfolder.id}`, true)}>Delete</div>
                      </div>
                    </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
