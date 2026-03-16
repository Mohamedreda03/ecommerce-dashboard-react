import { describe, it, expect } from "vitest";
import { renderWithProviders } from "./test/utils";
import App from "./App";

describe("App", () => {
  it("mounts without throwing", () => {
    const { container } = renderWithProviders(<App />);
    expect(container).toBeInTheDocument();
  });
});
