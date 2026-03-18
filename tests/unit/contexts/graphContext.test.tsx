import { act, render, renderHook, waitFor } from '@testing-library/react';
import { useEffect } from 'react';

import {
  GraphProvider,
  useGraphEvent,
  useGraphInstance,
  useGraphStore,
} from '@/contexts/graphContext';

class MockNode {
  id: string;
  data: any;
  tools: any;
  ports: any;
  attrs: any;
  width?: number;
  height?: number;
  selected?: boolean;

  constructor(config: any) {
    this.id = config.id;
    this.data = config.data || {};
    this.tools = config.tools;
    this.ports = config.ports;
    this.attrs = config.attrs;
    this.width = config.width;
    this.height = config.height;
    this.selected = config.selected;
  }

  isNode() {
    return true;
  }

  isEdge() {
    return false;
  }

  getData() {
    return this.data;
  }

  setData(data: any) {
    this.data = { ...this.data, ...data };
  }

  removeTools() {
    this.tools = undefined;
  }

  addTools(tools: any) {
    this.tools = tools;
  }

  prop(key: string, value: any) {
    if (typeof value !== 'undefined') {
      (this as any)[key] = value;
    }
    return (this as any)[key];
  }

  getSize() {
    return { width: this.width ?? 0, height: this.height ?? 0 };
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  setAttrByPath(path: string, value: any) {
    this.attrs = { ...(this.attrs || {}), [path]: value };
  }

  setAttrs(attrs: any) {
    this.attrs = { ...(this.attrs || {}), ...attrs };
  }

  toJSON() {
    return {
      id: this.id,
      data: this.data,
      tools: this.tools,
      ports: this.ports,
      attrs: this.attrs,
      width: this.width,
      height: this.height,
      selected: this.selected,
    };
  }
}

class MockEdge {
  id: string;
  data: any;
  attrs: any;
  labels: any;
  target: any;
  source: any;
  selected?: boolean;

  constructor(config: any) {
    this.id = config.id;
    this.data = config.data || {};
    this.attrs = config.attrs;
    this.labels = config.labels;
    this.target = config.target;
    this.source = config.source;
    this.selected = config.selected;
  }

  isNode() {
    return false;
  }

  isEdge() {
    return true;
  }

  getData() {
    return this.data;
  }

  setData(data: any) {
    this.data = { ...this.data, ...data };
  }

  setAttrs(attrs: any) {
    this.attrs = { ...(this.attrs || {}), ...attrs };
  }

  setLabels(labels: any) {
    this.labels = labels;
  }

  setTarget(target: any) {
    this.target = target;
  }

  setSource(source: any) {
    this.source = source;
  }

  toJSON() {
    return {
      id: this.id,
      data: this.data,
      attrs: this.attrs,
      labels: this.labels,
      target: this.target,
      source: this.source,
      selected: this.selected,
    };
  }
}

class MockGraph {
  nodes: MockNode[] = [];
  edges: MockEdge[] = [];
  events: Record<string, Set<(evt: any) => void>> = {};

  addNode(nodeConfig: any) {
    const node = nodeConfig instanceof MockNode ? nodeConfig : new MockNode(nodeConfig);
    this.nodes.push(node);
    return node;
  }

  addNodes(nodes: any[]) {
    nodes.forEach((node) => this.addNode(node));
  }

  addEdges(edges: any[]) {
    edges.forEach((edge) => this.addEdge(edge));
  }

  addEdge(edgeConfig: any) {
    const edge = edgeConfig instanceof MockEdge ? edgeConfig : new MockEdge(edgeConfig);
    this.edges.push(edge);
    return edge;
  }

  getCellById(id: string) {
    return this.nodes.find((node) => node.id === id) || this.edges.find((edge) => edge.id === id);
  }

  removeNode(cell: any) {
    this.nodes = this.nodes.filter((node) => node.id !== cell?.id);
  }

  removeEdge(cell: any) {
    this.edges = this.edges.filter((edge) => edge.id !== cell?.id);
  }

  getNodes() {
    return this.nodes;
  }

  getEdges() {
    return this.edges;
  }

  clearCells() {
    this.nodes = [];
    this.edges = [];
  }

  select(cell: any) {
    if (cell) {
      cell.selected = true;
    }
  }

  unselect(cell: any) {
    if (cell) {
      cell.selected = false;
    }
  }

  on(eventName: string, handler: (evt: any) => void) {
    if (!this.events[eventName]) {
      this.events[eventName] = new Set();
    }
    this.events[eventName].add(handler);
  }

  off(eventName: string, handler: (evt: any) => void) {
    if (this.events[eventName]) {
      this.events[eventName].delete(handler);
    }
  }

  trigger(eventName: string, payload: any) {
    this.events[eventName]?.forEach((handler) => handler(payload));
  }
}

jest.mock('@antv/x6', () => ({
  __esModule: true,
  Graph: MockGraph,
}));

describe('graphContext (src/contexts/graphContext.tsx)', () => {
  it('throws when hooks are used outside the provider', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const useStoreOutside = () =>
      // eslint-disable-next-line react-hooks/rules-of-hooks
      renderHook(() => useGraphStore((state) => state));
    const useInstanceOutside = () =>
      // eslint-disable-next-line react-hooks/rules-of-hooks
      renderHook(() => useGraphInstance());

    expect(() => useStoreOutside()).toThrow('useGraphStore must be used within GraphProvider');
    expect(() => useInstanceOutside()).toThrow(
      'useGraphInstance must be used within GraphProvider',
    );
    consoleErrorSpy.mockRestore();
  });

  it('manages nodes and edges and syncs graph data', () => {
    const wrapper = ({ children }: { children: any }) => <GraphProvider>{children}</GraphProvider>;
    const graph = new MockGraph();

    const { result } = renderHook(() => useGraphStore((state) => state), { wrapper });

    act(() => {
      result.current.setGraph(graph as any);
    });

    act(() => {
      result.current.addNodes([{ id: 'node-1', data: { label: 'Node 1' } }]);
    });

    expect(graph.getNodes()).toHaveLength(1);
    expect(result.current.nodes).toEqual([{ id: 'node-1', data: { label: 'Node 1' } }]);

    act(() => {
      result.current.updateNode('node-1', {
        data: { scalingFactor: 2 },
        tools: ['tool'],
        ports: { items: [{ id: 'p1', group: 'groupInput' }] },
        width: 80,
        height: 40,
        label: 'Node label',
        attrs: { stroke: 'blue' },
        selected: true,
      });
    });

    expect(graph.getCellById('node-1')?.getData()).toEqual({ label: 'Node 1', scalingFactor: 2 });
    expect(result.current.nodes[0]).toMatchObject({
      id: 'node-1',
      data: { scalingFactor: 2 },
      tools: ['tool'],
      ports: { items: [{ id: 'p1', group: 'groupInput' }] },
      width: 80,
      height: 40,
      label: 'Node label',
      attrs: { stroke: 'blue' },
      selected: true,
    });

    act(() => {
      result.current.removeNodes(['node-1']);
    });

    expect(graph.getNodes()).toHaveLength(0);
    expect(result.current.nodes).toEqual([]);

    act(() => {
      result.current.initData({
        nodes: [{ id: 'init-node' }],
        edges: [{ id: 'edge-1', data: { node: { sourceNodeID: 'existing-node' } } }],
      });
    });

    expect(graph.getNodes()).toHaveLength(1);
    expect(graph.getEdges()).toHaveLength(1);
    expect(result.current.nodes).toEqual([{ id: 'init-node' }]);
    expect(result.current.edges).toEqual([
      { id: 'edge-1', data: { node: { sourceNodeID: 'existing-node' } } },
    ]);

    act(() => {
      result.current.updateEdge('edge-1', {
        data: { connection: { isBalanced: true, exchangeAmount: 2 } },
        attrs: { stroke: 'red' },
        labels: ['Edge'],
        target: { cell: 'target-node', port: 'target-port' },
        source: { cell: 'source-node', port: 'source-port' },
        selected: true,
      });
    });

    expect(graph.getCellById('edge-1')?.getData()).toEqual({
      node: { sourceNodeID: 'existing-node' },
      connection: { isBalanced: true, exchangeAmount: 2 },
    });
    expect(result.current.edges[0]).toMatchObject({
      id: 'edge-1',
      data: { connection: { isBalanced: true, exchangeAmount: 2 } },
      attrs: { stroke: 'red' },
      labels: ['Edge'],
      target: { cell: 'target-node', port: 'target-port' },
      source: { cell: 'source-node', port: 'source-port' },
      selected: true,
    });
    expect(result.current.edges[1]).toMatchObject({
      id: 'edge-1',
      data: {
        node: { sourceNodeID: 'existing-node' },
        connection: { isBalanced: true, exchangeAmount: 2 },
      },
    });

    act(() => {
      result.current.removeEdges(['edge-1']);
    });

    expect(graph.getEdges()).toHaveLength(0);
    expect(result.current.edges).toEqual([]);

    graph.addNode({ id: 'sync-node', data: { label: 'Synced Node' }, attrs: { color: 'green' } });
    graph.addEdge({
      id: 'sync-edge',
      data: { connection: { isBalanced: false } },
      attrs: { color: 'blue' },
    });

    act(() => {
      result.current.syncGraphData();
    });

    expect(result.current.nodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'init-node' }),
        expect.objectContaining({ id: 'sync-node', data: { label: 'Synced Node' } }),
      ]),
    );
    expect(result.current.nodes).toHaveLength(2);
    expect(result.current.edges).toEqual([
      expect.objectContaining({ id: 'sync-edge', data: { connection: { isBalanced: false } } }),
    ]);
  });

  it('registers and cleans up graph events', async () => {
    const graph = new MockGraph();
    const handler = jest.fn();

    const EventConsumer = () => {
      const { setGraph, setNodes } = useGraphStore((state) => ({
        setGraph: state.setGraph,
        setNodes: state.setNodes,
      }));

      useEffect(() => {
        setGraph(graph as any);
        setNodes([]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

      useGraphEvent('node:click', handler);
      return null;
    };

    const { unmount } = render(
      <GraphProvider>
        <EventConsumer />
      </GraphProvider>,
    );

    await waitFor(() => {
      expect(graph.events['node:click']?.size).toBe(1);
    });

    act(() => {
      graph.trigger('node:click', { id: 'n1' });
    });

    expect(handler).toHaveBeenCalledWith({ id: 'n1' });

    unmount();

    expect(graph.events['node:click']?.size || 0).toBe(0);
  });
});
