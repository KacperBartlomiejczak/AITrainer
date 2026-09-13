import { act, renderHook, waitFor } from "@testing-library/react-native";
import { useAsyncResource } from "../use-async-resource";

const EMPTY: string[] = [];

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

describe("useAsyncResource", () => {
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it("starts loading and exposes the loaded data", async () => {
    const load = jest.fn(async () => ["FBW A"]);
    const { result } = await renderHook(() => useAsyncResource(load, EMPTY, "routines"));

    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.data).toEqual(["FBW A"]);
  });

  it("reports an error and keeps the initial data when loading fails", async () => {
    const load = jest.fn(async (): Promise<string[]> => Promise.reject(new Error("db down")));
    const { result } = await renderHook(() => useAsyncResource(load, EMPTY, "routines"));

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.data).toBe(EMPTY);
    expect(errorSpy).toHaveBeenCalledWith("[db] Failed to load routines", expect.any(Error));
  });

  it("reloads on demand", async () => {
    let value = "first";
    const load = jest.fn(async () => [value]);
    const { result } = await renderHook(() => useAsyncResource(load, EMPTY, "routines"));
    await waitFor(() => expect(result.current.data).toEqual(["first"]));

    value = "second";
    await act(async () => {
      await result.current.reload();
    });

    expect(result.current.data).toEqual(["second"]);
  });

  it("ignores a slower, outdated response", async () => {
    const slow = deferred<string[]>();
    const load = jest
      .fn<Promise<string[]>, []>()
      .mockImplementationOnce(() => slow.promise)
      .mockImplementation(async () => ["fresh"]);
    const { result } = await renderHook(() => useAsyncResource(load, EMPTY, "routines"));

    await act(async () => {
      await result.current.reload();
    });
    await act(async () => {
      slow.resolve(["stale"]);
    });

    expect(result.current.data).toEqual(["fresh"]);
  });
});
