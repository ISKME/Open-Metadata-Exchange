// ToDo: rquivallent must be rewritten
// ToDo: gather in single source for themes

export const globalStyles = {
  '.MuiAccordionSummary-contentGutters': {
    margin: '0 !important',
  },
  '.MuiAccordionSummary-gutters': {
    minHeight: '36px !important',
  },
}

export const accordionStyles = {
  accordion: {
    boxShadow: 'none',
    marginBottom: '4px',
  },
  sub: {
    marginBottom: '16px',
    border: '1px solid #d6d8da',
    boxShadow: 'none',
    borderRadius: '4px',
    '&::before': {
      opacity: '0',
    },
  },
  summary: {
    backgroundColor: '#303e48',
    stroke: '#fad000',
    color: '#fad000',
    borderRadius: '4px',
    boxShadow: 'none',
  },
  inner: {
    borderRadius: '4px',
    boxShadow: 'none',
    '&.Mui-expanded': {
      backgroundColor: '#56788f',
      border: 'none',
      stroke: 'white',
      color: 'white',
    },
  },
}

export const notesStyle = {
  padding: '15px 20px 20px',
  backgroundColor: '#efeff1',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
}

export const styles = `
mark {
  font-style: normal;
  font-weight: inherit;
}
input[type="text"] {
  height: 32px;
  box-shadow: none;
  border: none;
}
input[type="text"]:focus {
  box-shadow: none;
  border: none;
}
.highlight {
  background: yellow;
}
textarea {
  box-shadow: none;
  border: none;
}
textarea:focus {
  box-shadow: none;
  border: none;
}
.sidebar {
  position: relative;
  padding-right: 10px;
  min-height: 50px;
  font-family: "Roboto", sans-serif;
}
.sidebar a {
  text-decoration: none;
}
.sidebar h1,
.sidebar h2 {
  font-size: 26px;
  line-height: 1.1;
  font-family: "DINPro", sans-serif;
  color: #303e48;
  font-weight: 500;
  margin-bottom: 16px;
}
.sidebar h2 {
  font-size: 24px;
  margin-top: 24px;
}
.show-popup-form-button.mod-case-annotation {
  display: inline-block;
  padding: 4px 15px 4px 10px;
  background-color: #56798f;
  border-radius: 2px;
  color: #ffffff;
  font-size: 13px;
  font-family: "DINPro", sans-serif;
  outline: none;
  border-color: transparent;
  text-align: center;
  vertical-align: middle;
}
.toggle-collapse {
  display: inline-block;
}
.toggle-part button {
  float: right;
  margin-top: 24px;
}
.case-fields {
  padding-bottom: 5px;
}

.case-field {
  display: inline;
  font: 400 13px/21px "Roboto", sans-serif;
  color: #333333;
  padding-inline-start: 0;
  list-style-type: none;
}
.case-field:after {
  content: "|";
  display: inline;
  margin-left: 4px;
  color: #d9d9da;
}
.case-field:last-child:after {
  display: none;
}
.case-field dt {
  display: inline;
  font-weight: 400;
  margin-right: 3px;
}
.case-field dd,
.case-field li {
  display: inline;
}
.case-field dd:after,
.case-field li:after {
  content: "/";
  display: inline;
  margin: 0 8px;
  color: #d9d9da;
}
.case-field dd:last-child:after,
.case-field li:last-child:after {
  display: none;
}
.case-field dd a,
.case-field li a {
  color: #56788f;
}

.hashmarks-ct {
  margin-top: 1px;
  padding: 5px 10px 10px;
  background-color: #000000;
}

.hashmarks-help-text {
  color: #8a8a8a;
  font-size: 12px;
}

.hashmarks {
  height: 25px;
  margin-top: 5px;
  margin-bottom: 0;
}

.hashmark-panel {
  position: relative;
  display: none;
}
.hashmark-panel.active {
  display: block;
}
.hashmark-panel .tooltip.in {
  opacity: 1;
}
.hashmark-panel .tooltip.top .tooltip-arrow {
  border-top-color: #ffffff;
}
.hashmark-panel .tooltip-inner {
  -moz-box-shadow: 1px 2px 8px 0 rgba(0, 0, 0, 0.2);
  -webkit-box-shadow: 1px 2px 8px 0 rgba(0, 0, 0, 0.2);
  box-shadow: 1px 2px 8px 0 rgba(0, 0, 0, 0.2);
  color: #303e48;
  background-color: #ffffff;
}

.hashmark-link {
  position: absolute !important;
  top: 0;
  display: block;
  width: 4px;
  height: 25px;
  background-color: #56798f;
}
.hashmark-link:hover,
.hashmark-link.selected {
  background-color: #84a5bc;
}
.links {
  position: relative;
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}
@media only screen and (max-width: 767px) {
  .links .how-to-wrapper {
      margin-top: 10px;
  }
}
.links > a {
  margin-right: 15px;
}
.case .copyright-comment {
  margin-top: 16px;
  margin-bottom: 17px;
  font-family: "Roboto", sans-serif;
  font-size: 12px;
  font-weight: 400;
}
.case .copyright-comment div {
  margin-bottom: 2px;
}
.case .copyright-comment p {
  margin: 0;
}
.case .tab-content .text {
  line-height: 24px;
  font-family: "Roboto", sans-serif;
  font-size: 14px;
  font-weight: 400;
}

.links a,
.case-link {
  padding: 0;
  color: #56788f;
  font-family: "DINPro", sans-serif;
  font-size: 15px;
  text-align: left;
  border: 0;
  background: transparent;
}
.links a i,
.case-link i {
  padding-right: 2px;
  vertical-align: -2px;
  color: #303e48;
  font-size: 16px;
}
.links a i.fa-question-circle,
.case-link i.fa-question-circle {
  vertical-align: 0;
}
.links a:hover,
.case-link:hover {
  color: #666666;
}
.links a:hover i,
.case-link:hover i {
  color: #8f9bae;
}
.links a.how-to-link .how-to-link-popover-content,
.case-link.how-to-link .how-to-link-popover-content {
  display: none;
}
.show-popup-form-button {
  border-radius: 3px;
  padding: 0;
  outline: none;
  border: none;
  font-size: 13px;
}
@media only screen and (max-width: 767px) {
  .show-popup-form-button {
      display: block;
      margin-top: 10px;
      margin-left: -2px;
  }
}
.show-popup-form-button:hover,
.show-popup-form-button:focus {
  color: #8f9bae;
}
.show-popup-form-button:hover .fa,
.show-popup-form-button:focus .fa {
  color: #ffffff;
}
.show-popup-form-button .fa {
  width: 20px;
  height: 20px;
  margin-right: 5px;
  padding: 4px;
  font-size: 13px;
}
.btn-link {
  cursor: pointer;
}
.show-popup-form-button.mod-video-note,
.show-popup-form-button.mod-material-note,
.show-popup-form-button.mod-case-annotation {
  display: inline-block;
  padding: 4px 15px 4px 10px;
  background-color: #56798f;
  border-radius: 2px;
  color: #ffffff;
}
.show-popup-form-button.mod-case-annotation {
  margin-top: 15px;
}
.commentary {
  font-family: "DINPro", sans-serif;
  position: relative;
}
.commentary > div {
  display:flex;
  align-items: flex-start;
  gap: 16px;
}
.commentary h3 {
  margin-bottom: 15px;
  font-size: 16px;
}
.commentary h4 {
  margin-bottom: 15px;
  font-size: 16px;
}
.commentary p {
  line-height: 24px;
  font-size: 15px;
  margin: 0 0 10px;
}

.tooltip {
  position: relative;
  display: inline-block;
  border-bottom: 1px dotted black;
  cursor: pointer;
}
.tooltip .tooltiptext {
  visibility: hidden;
  width: 120px;
  background-color: #555;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 5px 0;
  position: absolute;
  z-index: 1000;
  bottom: 125%;
  left: 50%;
  margin-left: -60px;
  opacity: 0;
  transition: opacity 0.3s;
}
.tooltip .tooltiptext::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #555 transparent transparent transparent;
}
.tooltip:hover .tooltiptext {
  visibility: visible;
  opacity: 1;
}
#control {
  background-image: url("/static/comment.png");
  cursor: pointer;
  position: absolute;
  width: 40px;
  height: 40px;
  filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, .25));
}
#control:hover {
  filter: sepia(1);
}
`
