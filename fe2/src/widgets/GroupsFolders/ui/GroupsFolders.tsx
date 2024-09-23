/* eslint-disable react/prop-types */
/* eslint-disable max-len */
/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/anchor-is-valid */
// @ts-nocheck
import * as React from 'react';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem, treeItemClasses } from '@mui/x-tree-view/TreeItem';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import Pagination from '@mui/material/Pagination';
import Button from '@mui/material/Button';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DescriptionIcon from '@mui/icons-material/Description';
import Modal from '@mui/material/Modal';
import { CardCase } from 'widgets/CardCase';
import cls from './GroupsFolders.module.scss';

const data = [
  {
    title: 'Acquiring Specific Viewing Strategies In Order to Comprehend Visual Text - Case 2162',
    description: 'In this case the teacher models active listening and effective speaking skills and provides guided practice and the students share points of view, experiences, take turns speaking, make eye contact, stay on topic, and make decisions.',
    picture: '//cdnapisec.kaltura.com/p/1821311/thumbnail/entry_id/0_scom3sgc/width/200/height/130',
  },
  {
    title: 'Activating Background Knowledge About Force and Motion - Case 1836',
    description: 'In this case the teacher is facilitating a discussion based on activity stations on force and motion the class completed the day before and the students are discussing and engaging in arguments about their observations and possible explanations.',
    picture: '//cdnapisec.kaltura.com/p/1821311/thumbnail/entry_id/0_oogla4hz/width/200/height/130',
  },
  {
    title: 'Activating Prior Knowledge About Functions - Case 993',
    description: 'This case shows a teacher working with a precalculus class about their knowledge of functions and students analyzing and predicting graphical representations of various functions.',
    picture: '//cdnapisec.kaltura.com/p/1821311/thumbnail/entry_id/0_fc63xdw3/width/200/height/130',
  },
  // {
  //   title: '',
  //   description: '',
  //   picture: '',
  // },
];

const CustomTreeItem = styled(TreeItem)({
  [`& .${treeItemClasses.iconContainer}`]: {
    '& .close': {
      opacity: 0.3,
    },
  },
});

const getTreeItemsFromData = (treeItems) => treeItems.map((treeItemData) => {
  let children;
  if (treeItemData.children && treeItemData.children.length > 0) {
    children = getTreeItemsFromData(treeItemData.children);
  }
  return (
    <CustomTreeItem
      key={treeItemData.id}
      itemId={treeItemData.id}
      nodeId={treeItemData.id}
      label={treeItemData.name}
    >
      {children}
    </CustomTreeItem>
  );
});

const DataTreeView = ({ treeItems, onSelect = (id) => {} }) => (
  <SimpleTreeView
    aria-label="customize"
    defaultExpandedItems={['1']}
    slots={{
      expandIcon: FolderIcon,
      collapseIcon: FolderOpenIcon,
      endIcon: FolderIcon, // DescriptionIcon,
    }}
    sx={{
      overflowX: 'hidden', minHeight: 270, flexGrow: 1, maxWidth: 300,
    }}
    onItemFocus={(event, id) => onSelect(id)}
  >
    {getTreeItemsFromData(treeItems)}
  </SimpleTreeView>
);

function filterObjectArray(arr, filter) {
  return arr.filter(filter).map((obj) => (obj.children ? {
    ...obj,
    children: filterObjectArray(obj.children, filter),
  } : obj));
}

function findNestedObjById(tree, id, callback) {
  if (tree.id === id) {
    callback(tree);
    return [];
  }
  if (tree.children) {
    let path;
    tree.children.some((child, index) => {
      path = findNestedObjById(child, id, callback);
      if (path) {
        path.unshift(index);
        return true;
      }
    });
    return path;
  }
}

export function GroupsFolders({ folders }) {
  const [checked, setChecked] = React.useState(false);
  const handleChecked = (event) => {
    setChecked([event.target.checked]);
  };
  const [item, setItem] = React.useState('');
  const handleItem = (event) => {
    setItem(event.target.value);
  };
  const [id, setId] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [openRename, setOpenRename] = React.useState(false);
  const [openNew, setOpenNew] = React.useState(false);
  const [name, setName] = React.useState('');

  React.useEffect(() => {
    if (id !== null) {
      findNestedObjById({ children: treeData }, id, (tree) => {
        setName(tree.name);
      });
    }
  }, [id])

  const [treeData, setTreeData] = React.useState([]);
  React.useEffect(() => {
    let i = 1;
    setTreeData([
      {
        id: 0,
        name: 'All Cases',
        children: folders.map((name) => ({
          id: i++,
          name,
          children: [],
        }))
      },
    ]);
  }, [folders]);

  function del(id) {
    setTreeData(filterObjectArray(treeData, (obj) => obj.id !== id));
    setId(null);
    setOpen(false);
  }

  function rename(id) {
    findNestedObjById({ children: treeData }, id, (tree) => {
      tree.name = name;
    });
    setTreeData(treeData);
    setId(null);
    setOpenRename(false);
    setName('');
  }

  function create() {
    const item = {
      id: Math.floor(Math.random() * 1000000),
      name,
      children: [],
    };
    if (!id) {
      treeData.push(item);
    } else {
      findNestedObjById({ children: treeData }, id, (tree) => {
        tree.children.push(item);
      });
      setId(null);
    }
    setTreeData(treeData);
    setOpenNew(false);
    setName('');
  }

  const modalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 700,
    bgcolor: 'background.paper',
    borderRadius: '8px',
    boxShadow: 24,
    p: 4,
  };

  return (
    <>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Are you sure you wanna delete this item?
            All inner content and folders will be removed.
          </Typography>
          <Button onClick={() => del(id)}>Confirm</Button>
        </Box>
      </Modal>
      <Modal
        open={openRename}
        onClose={() => setOpenRename(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Enter the folder title you want to rename to
          </Typography>
          <TextField label="Title" variant="outlined" margin="dense" value={name} onChange={({ target }) => setName(target.value)} />
          <br />
          <Button onClick={() => rename(id)}>Confirm</Button>
          <Button onClick={() => {
            setId(null);
            setOpenRename(false);
            setName('');
          }}>Cancel</Button>
        </Box>
      </Modal>
      <Modal
        open={openNew}
        onClose={() => setOpenNew(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Enter the title you wanna create
          </Typography>
          <TextField label="Title" variant="outlined" margin="dense" value={name} onChange={({ target }) => setName(target.value)} />
          <br />
          <Button onClick={() => create()}>Confirm</Button>
        </Box>
      </Modal>
      <Grid container spacing={2} sx={{ padding: '0 10%' }}>
        <Grid item xs={4}>
          <Grid container>
            <Grid item>
              <Button onClick={() => setOpenNew(true)}>New</Button>
            </Grid>
            <Grid item>
              <Button onClick={() => setOpenRename(true)}>Rename</Button>
            </Grid>
            <Grid item>
              <Button onClick={() => setOpen(true)}>Delete</Button>
            </Grid>
          </Grid>
          <DataTreeView treeItems={treeData} onSelect={(id) => setId(id)} />
        </Grid>
        <Grid item xs={8}>
          <Paper
            elevation={3}
            sx={{
              display: 'flex', gap: '4px', backgroundColor: '#efeff0', padding: '8px',
            }}
          >
            {/* checked={checked[0] && checked[1]}
            indeterminate={checked[0] !== checked[1]} */}
            <FormControlLabel
              label="Select all"
              control={(
                <Checkbox
                  onChange={handleChecked}
                  sx={{ backgroundColor: 'white', margin: '0 8px' }}
                />
              )}
            />
            {/* ??? */}
            <TextField id="outlined-basic" label="Search within cases" variant="outlined" sx={{ flex: 1, backgroundColor: 'white' }} />
            <FormControl sx={{ minWidth: '142px' }}>
              <InputLabel id="demo-simple-select-label">Sort</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                value={item}
                label="Sort"
                onChange={handleItem}
                sx={{ backgroundColor: 'white' }}
              >
                <MenuItem value={10}>By Title</MenuItem>
                <MenuItem value={20}>By Date</MenuItem>
                <MenuItem value={30}>By Popularity</MenuItem>
              </Select>
            </FormControl>
          </Paper>
          <Box
            sx={{
              gap: '24px',
              display: 'flex',
              flexDirection: 'column',
              marginTop: '32px',
              marginBottom: '64px',
            }}
          >
            {data.map((item, index) => (
              <CardCase
                key={index}
                title={item.title}
                picture={item.picture}
                description={item.description}
                items={[
                  ['Art'],
                  ['Grade 5'],
                  [
                    'Responding to',
                    'Interpreting',
                    'Evaluating Works of Art',
                  ],
                ]}
              />
            ))}
          </Box>
          <Pagination count={10} />
        </Grid>
      </Grid>
    </>
  );
}