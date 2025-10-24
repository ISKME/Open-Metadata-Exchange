import { Editor } from "grapesjs";
import { createElement } from "react";
import axios from "axios";

const createButton = (text: string, styles: object = {}) => {
  const button = document.createElement("button");
  button.innerText = text;
  Object.assign(button.style, styles);
  return button;
};

const createDivContainer = (styles: object = {}) => {
  const div = document.createElement("div");
  Object.assign(div.style, styles);
  return div;
};

const getCollectionItemHTML = (collection: any) => {
  return `
    <img src="${collection.image}" alt="${collection.title}" width="200" style="border-radius: 8px; margin-bottom: 10px;">
    <p style="font-weight: bold; text-align: center;">${collection.title}</p>
  `;
};

const getCollectionComponentHTML = (collection: any) => {
  return `
    <style>
    .curated-collection-li h4 {
        margin: 0;
        padding: 0;
      }
      .curated-collection-li {
        position: relative;
      }
      .curated-collection-li::marker {
        content: "";
      }
      .curated-collection-image-wrapper {
        position: relative;
      }
      .curated-collection-image-wrapper:after {
        left: 0;
        content: "";
        position: absolute;
        width: 100%;
        height: 100%;
        background: linear-gradient(rgba(71, 79, 96, 0.2), rgba(0, 0, 0, 0.9));
        top: 0;
      }
      .curated-collection-title {
        position: absolute;
        display: flex;
        justify-content: center;
        width: 100%;
        bottom: 20%;
        z-index: 10;
      }
      .curated-collection-title h4 {
        color: #ffffff;
        text-align: center;
        line-height: 1.2;
        font-weight: bold;
      }
      .curated-collection-resources {
        display: flex;
        justify-content: center;
        gap: 5px;
        width: 100%;
        padding: 10.5px;
      }
      .curated-collection-resources span {
        font-size: 12.5px;
        font-weight: normal;
        color: #474f60;
      }
      .overlay {
        color: #000;
        text-decoration: none;
      }
      .curated-collection-li:hover {
        box-shadow: 0 2px 10px 5px rgba(0, 0, 0, 0.3);
      }
    </style>
    <li class="curated-collection-li">
      <a class="curated-collection-ct overlay" href="${collection.url}">
        <div class="curated-collection-image-wrapper">
          <img class="curated-collection-image" src="${collection.image}" alt="${collection.title}" width="340" height="170" style="object-fit: contain">
          <div class="curated-collection-title">
            <h4 role="heading" aria-level="3">${collection.title}</h4>
          </div>
        </div>
        <div class="curated-collection-resources">
          <span class="notranslate">${collection.resource_count}</span>
          <span class="tx">${Number(collection.resource_count) > 1 ? 'Resources' : 'Resource'}
          </span>
        </div>
      </a>
    </li>
  `;
};

const createCollectionItem = (collection: any) => {
  const collectionItem = createDivContainer({
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "10px",
    border: "1px solid #ddd",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    borderRadius: "8px",
    transition: "transform 0.3s",
  });

  collectionItem.onmouseover = () => {
    collectionItem.style.transform = "scale(1.05)";
  };
  collectionItem.onmouseout = () => {
    collectionItem.style.transform = "scale(1)";
  };

  collectionItem.innerHTML = getCollectionItemHTML(collection);

  return collectionItem;
};

const partners = (editor: Editor) => {
  editor.BlockManager.add("my-component-block", {
    label: createElement(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        },
      },
      createElement("i", {
        className: "fa fa-cube",
        style: { fontSize: "40px", marginBottom: "8px" },
      }),
      createElement("span", null, "Partners")
    ) as unknown as string,
    content: { type: "my-component" },
    category: "Custom Components",
  });

  editor.DomComponents.addType("my-component", {
    model: {
      defaults: {
        tagName: "div",
        draggable: true,
        droppable: true,
        attributes: { class: "my-custom-component" },
        components: [
          {
            type: "text",
            content: "[[ partners ]]",
          },
        ],
      },
    },
    view: {
      // custom logic for displaying the component
    },
  });
};

const extendImageComponent = (editor: Editor) => {
  editor.DomComponents.addType("image", {
    model: {
      defaults: {
        traits: [
          {
            type: "text",
            name: "alt",
            label: "Alt",
          },
          {
            type: "text",
            name: "href",
            label: "Link",
          },
          {
            type: "text",
            name: "target_blank",
            label: "Open in new tab (Yes/No)",
            value: "No",
          },
          {
            type: "text",
            name: "overlay_text",
            label: "Overlay Text (max 255 chars)",
          },
        ],
      },

      init() {
        this.on("change:attributes:overlay_text", this.handleOverlayTextChange);
        this.on("removed", this.handleComponentRemoval);
        this.overlayText = null;
        setTimeout(() => {
          this.handleOverlayTextChange();
        }, 400);
        this.listenTo(editor, "component:drag:end", this.handleDragEnd);
      },

      handleOverlayTextChange() {
        let overlayText = this.attributes.attributes.overlay_text;
        if (overlayText && overlayText.length > 255) {
          overlayText = overlayText.substring(0, 255);
          this.set("overlay_text", overlayText);
        }

        const imgEl = this.view?.el;

        if (!imgEl) {
          console.log("Image element not found!");
          return;
        }

        // Save overlay_text attribute to img tag
        imgEl.setAttribute("overlay_text", overlayText || "");

        if (!overlayText) {
          if (this.overlayText) {
            this.overlayText.remove();
            this.overlayText = null;
          }
          return;
        }

        let imgContainer = imgEl.parentElement;

        // Ensure imgContainer is created or properly identified
        if (
          !imgContainer ||
          !imgContainer.classList.contains("img-text-container")
        ) {
          imgContainer = document.createElement("div");
          imgContainer.classList.add("img-text-container");
          imgContainer.style.position = "relative";
          imgContainer.style.display = "inline-block";

          if (imgEl.parentNode) {
            imgEl.parentNode.insertBefore(imgContainer, imgEl);
          }
          imgContainer.appendChild(imgEl);
        }

        if (!this.overlayText) {
          this.overlayText = document.createElement("div");
          const overlayTextStyle = `
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              color: white;
              background-color: rgba(0, 0, 0, 0.5);
              padding: 10px;
              max-width: 90%;
              width: 100%;
              word-wrap: break-word;
              text-align: center;
              pointer-events: none;
          `;
          this.overlayText.setAttribute("style", overlayTextStyle);

          imgContainer.appendChild(this.overlayText);
        }

        this.overlayText.innerText = overlayText || "";
      },

      handleComponentRemoval() {
        const imgEl = this.view?.el;

        if (imgEl) {
          const imgContainer = imgEl.parentElement;
          if (
            imgContainer &&
            imgContainer.classList.contains("img-text-container")
          ) {
            imgContainer.remove();
          }
        }
      },

      handleDragEnd(model) {
        // TODO: drag overlayText and overlayTextStyle along with image 
      },
    },
  });
};

const collections = (editor: Editor) => {
  const cache = {};
  editor.BlockManager.add("collections-block", {
    label: createElement(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        },
      },
      createElement("i", {
        className: "fa fa-folder-open",
        style: { fontSize: "40px", marginBottom: "8px" },
      }),
      createElement("span", null, "Collections")
    ) as unknown as string,
    content: { type: "collections-component" },
    category: "Custom Components",
  });

  editor.DomComponents.addType("collections-component", {
    model: {
      defaults: {
        tagName: "div",
        draggable: true,
        droppable: true,
        attributes: { class: "collections-component" },
        components: [],
        content: "",
        style: {
          width: "350px",
          height: "fit-content",
          "border-radius": "2px",
          "box-shadow": "0 2px 8px rgba(0, 0, 0, 0.2)",
          "margin": "0 auto"
        },
      },
      init() {
        this.on("change:style:width", () => {
          try {
            let currentPage = 1;
            let totalPages = 1;

            const modal = editor.Modal;
            modal.setTitle("Select Collection");

            const content = createDivContainer({
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "20px",
            });

            const paginationContainer = createDivContainer({
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "20px",
            });

            const prevButton = createButton("Previous", {
              marginRight: "10px",
            });
            const pageIndicator = document.createElement("span");
            pageIndicator.style.margin = "0 10px";
            const nextButton = createButton("Next", { marginLeft: "10px" });

            paginationContainer.appendChild(prevButton);
            paginationContainer.appendChild(pageIndicator);
            paginationContainer.appendChild(nextButton);
            content.appendChild(paginationContainer);

            const collectionsContainer = createDivContainer({
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "20px",
              padding: "20px",
            });
            content.appendChild(collectionsContainer);

            const fetchCollections = async (page: number) => {
              if (cache[page]) {
                totalPages = Math.ceil(cache[page].totalCount / 24);
                return cache[page].collections;
              }

              const response = await axios.get(
                `/api/curatedcollections/v1/curatedcollections?page=${page}`
              );
              const collections = response.data.results;

              cache[page] = {
                collections: collections,
                totalCount: response.data.count,
              };
              totalPages = Math.ceil(response.data.count / 24);

              return collections;
            };

            const renderCollections = async (page: number) => {
              collectionsContainer.innerHTML = "";

              const collections = await fetchCollections(page);
              collections.forEach((collection) => {
                const collectionItem = createCollectionItem(collection);
                collectionItem.onclick = async () => {
                  editor.Modal.close();
                  try {
                    const response = await axios.get(
                      `/api/curatedcollections/v1/curatedcollections/${collection.id}`
                    );
                    const selectedCollection = response.data;
                    this.set(
                      "content",
                      getCollectionComponentHTML(selectedCollection)
                    );
                  } catch (error) {
                    console.error("Error fetching collection data: ", error);
                  }
                };
                collectionsContainer.appendChild(collectionItem);
              });

              pageIndicator.innerText = `Page ${currentPage} of ${totalPages}`;
              prevButton.disabled = currentPage <= 1;
              nextButton.disabled = currentPage >= totalPages;
            };

            renderCollections(currentPage);

            prevButton.onclick = () => {
              if (currentPage > 1) {
                currentPage--;
                renderCollections(currentPage);
              }
            };
            nextButton.onclick = () => {
              if (currentPage < totalPages) {
                currentPage++;
                renderCollections(currentPage);
              }
            };

            modal.setContent(content);
            modal.open();
          } catch (error) {
            console.error("Error fetching collections:", error);
          }
        });
      },
    },
    view: {},
  });
};

const plugin2 = (editor: Editor) => {
  editor.BlockManager.add("my-second-component-block", {
    label: createElement(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        },
      },
      createElement("i", {
        className: "fa fa-star",
        style: { fontSize: "40px", marginBottom: "8px", color: "gold" },
      }),
      createElement("span", null, "My Second Component")
    ) as unknown as string,
    content: { type: "my-second-component" },
    category: "Custom Components",
  });

  editor.DomComponents.addType("my-second-component", {
    model: {
      defaults: {
        tagName: "div",
        draggable: true,
        droppable: true,
        attributes: { class: "my-second-custom-component" },
        components: [
          {
            type: "text",
            content: "This is my second custom component",
          },
        ],
      },
    },
    view: {
      // custom logic for displaying the component
    },
  });
};

export const customPlugins = (editor: Editor) => {
  partners(editor);
  extendImageComponent(editor);
  collections(editor);
  plugin2(editor);
};
