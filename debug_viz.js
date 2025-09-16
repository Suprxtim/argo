// Debug script to test base64 decoding of visualization HTML
const testPlotUrl = "data:text/html;base64,PGh0bWw+PGhlYWQ+PHRpdGxlPlRlc3Q8L3RpdGxlPjwvaGVhZD48Ym9keT48aDE+VGVzdCBWaXN1YWxpemF0aW9uPC9oMT48L2JvZHk+PC9odG1sPg==";

console.log("Plot URL:", testPlotUrl);
console.log("Starts with correct prefix:", testPlotUrl.startsWith('data:text/html;base64,'));

if (testPlotUrl.startsWith('data:text/html;base64,')) {
  try {
    const base64Data = testPlotUrl.replace('data:text/html;base64,', '');
    console.log("Base64 data extracted:", base64Data);
    
    const decodedHtml = atob(base64Data);
    console.log("Decoded HTML:", decodedHtml);
  } catch (error) {
    console.error("Error decoding base64 HTML:", error);
  }
}