export function convertSeconds(seconds, full = false) {
  seconds = Number(seconds || 0)
  if (seconds === 0) return '00:00'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secondsRemaining = seconds % 60
  if (full) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secondsRemaining.toString().padStart(2, '0')}`
  }
  if (hours > 0)
   return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secondsRemaining.toString().padStart(2, '0')}`
  // } else if (minutes > 0) {
  return `${minutes.toString().padStart(2, '0')}:${secondsRemaining.toString().padStart(2, '0')}`
  // } else {
  //  return `${secondsRemaining.toString().padStart(2, '0')}`
  // }
}

/**  
* Groups data into sub-arrays based on the start_position being within the specified range.  
*  
* @param {number} range - The range to group the data by.  
* @param {object[]} data - The data to group.  
* @returns {object[][]} - The grouped data.  
*/  
export function categorizeByTimeRange(data, range) {
  // Sort the data by start_position
  data.sort((a, b) => a.start_position - b.start_position)
  // Initialize the result array with the first data point
  const result = [[data[0] || []]]
  // Iterate over the rest of the data
  for (let i = 1; i < data.length; i++) {
    // Get the current data point and the last group
    const current = data[i]
    const lastGroup = result[result.length - 1]
    // Get the start position of the first data point in the last group
    const firstStartPosition = lastGroup[0].start_position
    // Check if the current data point is within the range of the last group
    if (current.start_position - firstStartPosition <= range) {
      // Add the current data point to the last group
      lastGroup.push(current)
    } else {
      // Create a new group for the current data point
      result.push([current])
    }
  }
  return result
}

function getHtmlPosition(htmlString, textPosition) {
  // Create a temporary div to parse the HTML string
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlString;

  // Get the text content of the entire HTML string
  const textContent = tempDiv.textContent;

  // Ensure the text position is within the bounds of the text content
  if (textPosition < 0 || textPosition > textContent.length) {
    throw new Error('Invalid text position');
  }

  // Initialize variables to keep track of the current position in the text content and HTML string
  let currentTextPos = 0;
  let currentHtmlPos = 0;

  // Function to traverse nodes and find the HTML position
  function traverseNodes(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const nodeLength = node.textContent.length;
      if (currentTextPos + nodeLength >= textPosition) {
        currentHtmlPos += textPosition - currentTextPos;
        return true; // Stop traversal
      }
      currentTextPos += nodeLength;
      currentHtmlPos += nodeLength;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      currentHtmlPos += node.outerHTML.length - node.innerHTML.length;
      for (let i = 0; i < node.childNodes.length; i++) {
        if (traverseNodes(node.childNodes[i])) {
          return true; // Stop traversal
        }
      }
    }
    return false;
  }

  traverseNodes(tempDiv);

  return currentHtmlPos;
}

export function insertMarkTag(html, start, end) {
  start -= 2
  end -= 2
  const modified = html.slice(start, end).replace(/(<([a-zA-Z0-9]+)[^>]*>)/g, '$1<mark>').replace(/(<\/([a-zA-Z0-9]+)[^>]*>)/g, '</mark>$1')
  const result = `${html.slice(0, start)}<mark>${modified}</mark>${html.slice(end)}`
  return result
}

export function getTagPosition(htmlString, paragraphNumber) {
  paragraphNumber = parseInt(paragraphNumber) - 1
  const regex = /<p[^>]*>(.*?)<\/p>/g;
  let match;
  let currentParagraph = 0;
  let startPos = -1;
  let endPos = -1;

  while ((match = regex.exec(htmlString)) !== null) {
    if (currentParagraph == paragraphNumber) {
      startPos = match.index;
      endPos = regex.lastIndex;
      break;
    }
    currentParagraph++;
  }

  if (startPos === -1 || endPos === -1) {
    throw new Error('Paragraph not found');
  }

  return { startPos, endPos };
}

export const getTagPositions = (htmlString) => {
  const regex = /(<\/?([a-zA-Z0-9]+)[^>]*>)/g
  const positions = []
  let match
  while ((match = regex.exec(htmlString)) !== null) {
    const tag = match[1];                     // the full tag
    const startPos = match.index;             // start position of the tag
    const endPos = startPos + tag.length - 1; // end position of the tag
    positions.push({
      tag: match[2], // the tag name
      start: startPos,
      end: endPos
    })
  }
  return positions
}

export function paragraphNumber(html, index) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const all = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6, p'));
  let counter = -1
  for (let i = 0; i < all.length; i++) {
    if (all[i].tagName === 'P') counter++
    if (counter == index) return i
  }
}

export function getTextInRange(html, startPos, endPos) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const paragraphs = Array.from(doc.querySelectorAll('p'));
  let textInRange = '';

  for (let i = 0; i < paragraphs.length; i++) {
    const pText = paragraphs[i].textContent;

    if (i === startPos.paragraph && i === endPos.paragraph) {
      textInRange += pText.substring(startPos.position, endPos.position);
      break;
    } else if (i === startPos.paragraph) {
      textInRange += pText.substring(startPos.position);
    } else if (i > startPos.paragraph && i < endPos.paragraph) {
      textInRange += pText;
    } else if (i === endPos.paragraph) {
      textInRange += pText.substring(0, endPos.position);
      break;
    }
  }

  return textInRange;
}

export function getSelectionPosition() {
  const selection = document.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  const startContainer = range.startContainer;
  const endContainer = range.endContainer;

  const paragraphs = Array.from(document.querySelectorAll('.commentary>div>div>p'));
  let startPos = null;
  let endPos = null;

  paragraphs.forEach((p, index) => {
    if (p.contains(startContainer)) {
      const offset = getOffsetWithinParagraph(p, startContainer, range.startOffset);
      startPos = { paragraph: index, position: offset };
    }
    if (p.contains(endContainer)) {
      const offset = getOffsetWithinParagraph(p, endContainer, range.endOffset);
      endPos = { paragraph: index, position: offset };
    }
  });

  return { startPos, endPos };
}

function getOffsetWithinParagraph(paragraph, container, offset) {
  let currentNode = container;
  let currentOffset = offset;

  while (currentNode !== paragraph) {
    const parent = currentNode.parentNode;
    const siblings = Array.from(parent.childNodes);
    const index = siblings.indexOf(currentNode);

    for (let i = 0; i < index; i++) {
      currentOffset += siblings[i].textContent.length;
    }

    currentNode = parent;
  }

  return currentOffset;
}

export function findTextRange(html, text) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const elements = Array.from(doc.body.childNodes);
  text = text.replace(/\n/g, '')
  const start = doc.body.innerText.indexOf(text)
  let end = null
  if (start !== -1)
    end = start + text.length
  let raw = 0
  let total = 0
  let newStart = null
  let newEnd = null
  let paragraph = -1
  let startParagraph = -1
  let endParagraph = -1
  let startOffset = 0
  let endOffset = 0
  let offset = 0
  for (const node of elements) {
    raw += node.innerHTML.length
    total += node.outerHTML.length
    if (node.tagName === 'P') paragraph++
    if (newStart === null) {
      if (raw > start) {
        newStart = start + total - raw - 4
        startParagraph = paragraph
        startOffset = offset + 3
      }
    }
    if (newEnd === null) {
      if (raw >= end) {
        newEnd = end + total - raw - 4
        endParagraph = paragraph
        endOffset = offset + 3
      }
    }
    offset += node.outerHTML.length
    if (newStart !== null && newEnd !== null) break
  }
  if (newStart === null || newEnd === null) return null
  return {
    start: {
      paragraph: startParagraph,
      position: newStart - startOffset
    },
    end: {
      paragraph: endParagraph,
      position: newEnd - endOffset
    }
  }
}

export function timeToSeconds(duration, timeString, text = '') {
  if (typeof timeString === 'number') return timeString
  const parts = timeString.split(':')
  let seconds = 0
  if (parts.length === 3) {
    // hh:mm:ss format
    seconds = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2])
  } else if (parts.length === 2) {
    // mm:ss format
    seconds = parseInt(parts[0]) * 60 + parseInt(parts[1])
  } else if (parts.length === 1) {
    // ss format
    seconds = parseInt(parts[0])
  }
  if (isNaN(seconds)) alert('Enter valid time!')
  else if (seconds > duration) alert(text + ' time entered cannot be bigger than duration of the video')
  else if (seconds < 0) alert('Time cannot be negative')
  else return seconds
}

export function matchTimeFormat(input) {
  if (input === '') return false
  const regex = /^(?:(\d{1,2}):(\d{2}):(\d{2})|(\d{1,2}):(\d{2})|(\d{1,2}))$/
  return !regex.test(input)
}

export function matchDigitFormat(input) {
  const regex = /^\d+$/
  return !regex.test(input)
}

export function filtering(data, duration) {
  return data
    ?.filter(({ quote, can_view, user }) => !quote && can_view && user)
    ?.filter(({ start_position: s, end_position: e }) => (e <= duration && s >= 0 && s <= duration && e >= 0))
    || []
}

export const matomoTag = ({ category, action, name = '', value = null }) => {
  window._paq = window._paq || [];
  if (value) {
    window._paq.push(['trackEvent', category, action, name, value]);
  } else if (name) {
    window._paq.push(['trackEvent', category, action, name]);
  } else {
    window._paq.push(['trackEvent', category, action]);
  }
};
