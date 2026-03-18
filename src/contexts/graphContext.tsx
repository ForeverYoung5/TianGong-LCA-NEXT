import type {
  LifeCycleModelGraphEdge,
  LifeCycleModelGraphNode,
} from '@/services/lifeCycleModels/data';
import { Graph } from '@antv/x6';
import type { EventArgs as GraphEventArgs } from '@antv/x6/lib/graph/events';
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';

export type GraphNode = LifeCycleModelGraphNode;
export type GraphEdge = LifeCycleModelGraphEdge;

type GraphNodeUpdate = Partial<Omit<GraphNode, 'id'>> & {
  data?: Partial<NonNullable<GraphNode['data']>>;
};

type GraphEdgeUpdate = Omit<Partial<GraphEdge>, 'id' | 'data'> & {
  data?: Partial<NonNullable<GraphEdge['data']>>;
};

interface GraphContextValue {
  graph: Graph | null;
  setGraph: (graph: Graph | null) => void;
  nodes: GraphNode[];
  edges: GraphEdge[];
  setNodes: (nodes: GraphNode[]) => void;
  setEdges: (edges: GraphEdge[]) => void;
  addNodes: (nodes: GraphNode[]) => void;
  updateNode: (nodeId: string, data: GraphNodeUpdate) => void;
  removeNodes: (nodeIds: string[]) => void;
  updateEdge: (edgeId: string, data: GraphEdgeUpdate) => void;
  removeEdges: (edgeIds: string[]) => void;
  initData: (data: { nodes: GraphNode[]; edges: GraphEdge[] }) => void;
  syncGraphData: () => void;
}

const GraphContext = createContext<GraphContextValue | null>(null);

export const GraphProvider = ({ children }: { children: ReactNode }) => {
  const graphRef = useRef<Graph | null>(null);
  const [nodes, setNodesState] = useState<GraphNode[]>([]);
  const [edges, setEdgesState] = useState<GraphEdge[]>([]);

  const setGraph = (graph: Graph | null) => {
    graphRef.current = graph;
  };

  const setNodes = (newNodes: GraphNode[]) => {
    setNodesState(newNodes);
  };

  const setEdges = (newEdges: GraphEdge[]) => {
    setEdgesState(newEdges);
  };

  const addNodes = (nodesToAdd: GraphNode[]) => {
    if (graphRef.current) {
      nodesToAdd.forEach((node) => {
        graphRef.current?.addNode(node as unknown as Parameters<Graph['addNode']>[0]);
      });
      setNodesState((prev) => [...prev, ...nodesToAdd]);
    }
  };

  const updateNode = (nodeId: string, data: GraphNodeUpdate) => {
    if (graphRef.current) {
      const cell = graphRef.current.getCellById(nodeId);
      if (cell && cell.isNode()) {
        const node = cell;
        // 更新节点数据
        if (data.data) {
          const currentData = (node.getData() as Record<string, unknown> | null) || {};
          node.setData({ ...currentData, ...data.data });
        }

        // 更新工具
        if (data.tools) {
          node.removeTools();
          node.addTools(data.tools as Parameters<typeof node.addTools>[0]);
        }

        // 更新端口
        if (data.ports) {
          node.prop('ports', data.ports);
        }

        // 更新尺寸
        if (data.width !== undefined || data.height !== undefined) {
          node.resize(
            Number(data.width ?? node.getSize().width),
            Number(data.height ?? node.getSize().height),
          );
        }

        // 更新标签
        if (data.label !== undefined) {
          node.setAttrByPath('label/text', data.label as Parameters<typeof node.setAttrByPath>[1]);
        }

        // 更新属性
        if (data.attrs) {
          node.setAttrs(data.attrs as Parameters<typeof node.setAttrs>[0]);
        }

        // 更新选中状态
        if (data.selected !== undefined) {
          if (data.selected) {
            graphRef.current.select(node);
          } else {
            graphRef.current.unselect(node);
          }
        }

        // 更新本地状态
        setNodesState((prev) =>
          prev.map((n) => {
            if (n.id === nodeId) {
              return { ...n, ...data };
            }
            return n;
          }),
        );
      }
    }
  };

  const removeNodes = (nodeIds: string[]) => {
    if (graphRef.current) {
      nodeIds.forEach((id) => {
        const cell = graphRef.current?.getCellById(id);
        if (cell && cell.isNode()) {
          graphRef.current?.removeNode(cell);
        }
      });
      setNodesState((prev) => prev.filter((node) => !node.id || !nodeIds.includes(node.id)));
    }
  };

  const updateEdge = (edgeId: string, data: GraphEdgeUpdate) => {
    if (graphRef.current) {
      const edge = graphRef.current.getCellById(edgeId);
      let isConnect = false;
      if (edge && edge.isEdge()) {
        // 更新边数据
        if (data.data) {
          const currentData = (edge.getData() as Record<string, unknown> | null) || {};
          edge.setData({ ...currentData, ...data.data });
          if (data?.data?.connection) {
            isConnect = true;
          }
        }

        // 更新属性
        if (data.attrs) {
          edge.setAttrs(data.attrs as Parameters<typeof edge.setAttrs>[0]);
        }

        // 更新标签
        if (data.labels) {
          edge.setLabels(data.labels as Parameters<typeof edge.setLabels>[0]);
        }

        // 更新目标
        if (data.target) {
          edge.setTarget(data.target as Parameters<typeof edge.setTarget>[0]);
        }

        // 更新源
        if (data.source) {
          edge.setSource(data.source as Parameters<typeof edge.setSource>[0]);
        }

        // 更新选中状态
        if (data.selected !== undefined) {
          if (data.selected) {
            graphRef.current.select(edge);
          } else {
            graphRef.current.unselect(edge);
          }
        }

        // 更新本地状态
        setEdgesState((prev) => {
          const res = prev.map((e) => {
            if (e.id === edgeId) {
              return { ...e, ...data };
            }
            return e;
          });
          if (isConnect) {
            isConnect = false;
            return [...res, { ...edge }];
          }
          return res;
        });
      }
    }
  };

  const removeEdges = (edgeIds: string[]) => {
    if (graphRef.current) {
      edgeIds.forEach((id) => {
        const cell = graphRef.current?.getCellById(id);
        if (cell && cell.isEdge()) {
          graphRef.current?.removeEdge(cell);
        }
      });
      setEdgesState((prev) => prev.filter((edge) => !edge.id || !edgeIds.includes(edge.id)));
    }
  };

  const initData = (data: { nodes: GraphNode[]; edges: GraphEdge[] }) => {
    if (graphRef.current) {
      graphRef.current.clearCells();
      if (data.nodes && data.nodes.length > 0) {
        graphRef.current.addNodes(data.nodes as unknown as Parameters<Graph['addNodes']>[0]);
      }
      if (data.edges && data.edges.length > 0) {
        graphRef.current.addEdges(data.edges as unknown as Parameters<Graph['addEdges']>[0]);
      }
      setNodesState(data.nodes || []);
      setEdgesState(data.edges || []);
    }
  };

  // 同步图中的实际数据到状态
  const syncGraphData = () => {
    if (graphRef.current) {
      const graphNodes = graphRef.current.getNodes().map((node) => node.toJSON() as GraphNode);
      const graphEdges = graphRef.current.getEdges().map((edge) => edge.toJSON() as GraphEdge);
      setNodesState(graphNodes);
      setEdgesState(graphEdges);
    }
  };

  const value: GraphContextValue = {
    graph: graphRef.current,
    setGraph,
    nodes,
    edges,
    setNodes,
    setEdges,
    addNodes,
    updateNode,
    removeNodes,
    updateEdge,
    removeEdges,
    initData,
    syncGraphData,
  };

  return <GraphContext.Provider value={value}>{children}</GraphContext.Provider>;
};

export const useGraphStore = <T,>(selector: (state: GraphContextValue) => T): T => {
  const context = useContext(GraphContext);
  if (!context) {
    throw new Error('useGraphStore must be used within GraphProvider');
  }
  return selector(context);
};

export const useGraphInstance = () => {
  const context = useContext(GraphContext);
  if (!context) {
    throw new Error('useGraphInstance must be used within GraphProvider');
  }
  return context.graph;
};

export const useGraphEvent = <K extends keyof GraphEventArgs>(
  eventName: K,
  handler: (evt: GraphEventArgs[K]) => void,
) => {
  const graph = useGraphInstance();

  useEffect(() => {
    if (graph) {
      graph.on(eventName, handler);
      return () => {
        graph.off(eventName, handler);
      };
    }
  }, [graph, eventName, handler]);
};
