// RootIB: RB-20260307022444-C40FE03D
/**
 * RepoTalker – embeddable per-page talking-head widget.
 *
 * Usage:
 *   <div
 *     id="repotalker"
 *     data-page-id="docs/getting-started.md"
 *     data-api-base="https://your-backend.example.com"
 *   ></div>
 *   <script src="https://your-cdn.example.com/widget.js"></script>
 */
(async function () {
  const container = document.getElementById("repotalker");
  if (!container) return;

  const pageId = container.getAttribute("data-page-id");
  const apiBase = container.getAttribute("data-api-base") || "http://localhost:4000";

  if (!pageId) {
    console.warn("RepoTalker: missing data-page-id attribute");
    return;
  }

  function el(tag, styles, text) {
    const node = document.createElement(tag);
    if (styles) Object.assign(node.style, styles);
    if (text !== undefined) node.textContent = text;
    return node;
  }

  try {
    // Encode each path segment individually so slashes are preserved in the URL
    const encodedId = pageId.split("/").map(encodeURIComponent).join("/");
    const res = await fetch(`${apiBase}/api/pages/${encodedId}`);
    if (!res.ok) throw new Error(`Page not found (${res.status})`);
    const page = await res.json();

    const wrapper = el("div", {
      border: "1px solid #ddd",
      borderRadius: "8px",
      padding: "12px",
      fontFamily: "system-ui, sans-serif",
      maxWidth: "480px"
    });

    wrapper.appendChild(
      el("div", { fontWeight: "600", marginBottom: "8px" }, "Page Guide")
    );

    if (page.video_url) {
      const video = el("video", { width: "100%", borderRadius: "8px" });
      video.src = page.video_url;
      video.controls = true;
      wrapper.appendChild(video);
    } else {
      wrapper.appendChild(
        el("div", { color: "#999" }, "No narration available yet.")
      );
    }

    if (page.summary) {
      wrapper.appendChild(
        el("div", { marginTop: "8px", fontSize: "13px" }, page.summary)
      );
    }

    container.appendChild(wrapper);
  } catch (err) {
    console.error("RepoTalker widget error:", err);
    container.appendChild(
      el("div", { color: "#c00", fontSize: "13px" }, "RepoTalker: " + err.message)
    );
  }
})();
