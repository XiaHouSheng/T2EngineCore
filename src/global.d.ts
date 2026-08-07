/**
 * SimulationEngine 全局 TypeScript 声明文件
 *
 * 为项目中的 JavaScript 模块提供类型声明，
 * 使 TypeScript 语言服务能提供准确的智能提示与类型检查。
 *
 * 模块路径均相对于 src/ 目录解析。
 */

import type {
  Application,
  Container,
  Graphics,
  Sprite,
  Texture,
} from "pixi.js";

/* ============================================================
 *  公共类型定义
 * ============================================================ */

/** 网格坐标 */
export interface GridPosition {
  gridX: number;
  gridY: number;
}

/** 像素坐标 */
export interface PixelPosition {
  x: number;
  y: number;
}

/** 方向字面量 */
export type Direction = "up" | "down" | "left" | "right" | "cross";

/** 端口类型（传送带/管道 进出端口） */
export type PortType = "bi" | "bo" | "pi" | "po";

/** mask 单元格解析结果 */
export interface ParsedMaskCell {
  type?: PortType;
  dir?: Direction;
  portId?: string;
}

/** 锚点（0~1 比例坐标） */
export interface Anchor {
  x: number;
  y: number;
}

/** 机器类型定义（machineTypes 中的条目） */
export interface MachineType {
  id?: string;
  name?: string;
  gridWidth: number;
  gridHeight: number;
  anchor: Anchor[];
  mask: string[][] | null;
  recipe_id?: string[];
  port_recipe_icon?: Record<string, string | null>;
  port_offset_index?: number;
}

/** 机器实体（放置到场景中的机器实例） */
export interface MachineEntity extends MachineType {
  id: string;
  type: string;
  rotation: number;
  gridX: number;
  gridY: number;
  x?: number;
  y?: number;
  centerX?: number;
  centerY?: number;
  now_recipe?: string;
  now_mode?: string;
  defaultMask?: string[][];
}

/** 传送带/管道实体 */
export interface BeltPipeEntity {
  id: string;
  type: string;
  gridX: number;
  gridY: number;
  in: string;
  out: string;
  x?: number;
  y?: number;
}

/** 配方 */
export interface Recipe {
  id: string;
  name?: string;
  in?: Record<string, number>;
  out?: Record<string, number>;
  time?: number;
  producers?: string[];
}

/** 图标条目（data.json 中的 icons） */
export interface IconEntry {
  id: string;
  position: string;
  [k: string]: unknown;
}

/** 物品分类 */
export interface CategoryEntry {
  id: string;
  name?: string;
  [k: string]: unknown;
}

/** 物品条目 */
export interface ItemEntry {
  id: string;
  name?: string;
  machine?: {
    size?: [number, number];
    [k: string]: unknown;
  };
  [k: string]: unknown;
}

/** 端口/精灵纹理描述 */
export interface SpriteSheetEntry {
  texture: Texture;
  rotation: number;
}

/** 机器贴图覆盖配置 */
export interface MachineOverlay {
  texture: string;
  rotation?: number;
  name?: boolean;
  recipe?: boolean;
  port?: boolean;
  background?: boolean;
}

/** 冲突检测结果（机器/传送带/管道三类实体的冲突集合） */
export interface MetaConflict {
  machines: Record<string, MachineEntity>;
  belts: Record<string, BeltPipeEntity>;
  pipes: Record<string, BeltPipeEntity>;
}

/* ============================================================
 *  Vue SFC 模块声明
 * ============================================================ */

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}

/* ============================================================
 *  core_loader 模块
 * ============================================================ */

declare module "./core_loader/index.js" {
  export function initLoader(): Promise<void>;
}

declare module "./core_loader/LoadConfigs.js" {
  export function loadDataConfigs(): Promise<boolean>;
  export function loadIconSheet(): Promise<boolean>;
  export function loadTextures(): Promise<boolean>;
  export function loadMachineIcons(): Promise<boolean>;
  export function buildSpriteSheets(): boolean;
  export function loadAllConfigs(): Promise<boolean>;
}

/* ============================================================
 *  stores 模块（Pinia）
 * ============================================================ */

declare module "./stores/MachineStore.js" {
  import type { Container } from "pixi.js";
  import type { Store } from "pinia";
  import type { MachineType } from "./global";

  interface MachineStoreState {
    machineTypes: Record<string, MachineType>;
    machineContainerClasses: Record<string, new (machine: MachineType) => Container>;
    injectFromConfig: (configMap: Record<string, MachineType>, blacklist?: string[]) => void;
    setMachineContainerClass: (type: string, cls: new (machine: MachineType) => Container) => void;
  }
  export function useMachineStore(): Store<"machineStore", MachineStoreState>;
}

declare module "./stores/BeltStore.js" {
  import type { Store } from "pinia";

  interface BeltStoreState {
    beltTypes: Record<string, string>;
    nodeTypes: Set<string>;
    nodeDir: Record<string, { in: string; out: string }>;
    rotateMap: Record<string, string>;
  }
  export function useBeltStore(): Store<"beltStore", BeltStoreState>;
}

declare module "./stores/PipeStore.js" {
  import type { Store } from "pinia";

  interface PipeStoreState {
    pipeTypes: Record<string, string>;
    directions: Record<string, string>;
    nodeTypes: Set<string>;
    nodeDir: Record<string, { in: string; out: string }>;
    rotateMap: Record<string, string>;
  }
  export function usePipeStore(): Store<"pipeStore", PipeStoreState>;
}

declare module "./stores/CommandStore.js" {
  import type { Ref } from "vue";
  import type { Store } from "pinia";

  interface CommandStoreState {
    select_command: Ref<string>;
    last_command: Ref<string>;
    is_ctrl: Ref<boolean>;
    keyboard_command: Record<string, string>;
    keyboard_base_command: Record<string, string>;
    keyboard_sub_command: Record<string, string>;
    command_handle: Record<string, (...args: unknown[]) => unknown>;
    zomm_command_handle: Record<string, (...args: unknown[]) => unknown>;
    onCancel: () => void;
  }
  export function useCommandStore(): Store<"command", CommandStoreState>;
  export const CMD_DEFAULT: string;
  export const CMD_CANCEL: string;
}

declare module "./stores/ResourcesStore.js" {
  import type { Store } from "pinia";
  import type {
    IconEntry,
    CategoryEntry,
    ItemEntry,
    Recipe,
    MachineType,
    SpriteSheetEntry,
    MachineOverlay,
  } from "./global";

  interface ResourcesStoreState {
    black_list_machine: string[];
    icons: Record<string, IconEntry>;
    categories: Record<string, CategoryEntry>;
    items: Record<string, ItemEntry>;
    recipes: Record<string, Recipe>;
    machines: Record<string, MachineType>;
    textures: Record<string, Texture>;
    machineIcons: Record<string, Texture>;
    machineOverlays: Record<string, MachineOverlay>;
    beltSprites: Record<string, SpriteSheetEntry>;
    pipeSprites: Record<string, SpriteSheetEntry>;
    beltPorts: Record<string, SpriteSheetEntry>;
    pipePorts: Record<string, SpriteSheetEntry>;
    iconsheetTexture: Texture | null;
    setIcons: (arr: IconEntry[]) => void;
    setCategories: (arr: CategoryEntry[]) => void;
    setItems: (arr: ItemEntry[]) => void;
    setRecipes: (arr: Recipe[]) => void;
    setMachinesFromItems: (itemsArr: ItemEntry[]) => void;
    injectMachineRecipeIds: () => void;
    setIconTexture: (texture: Texture) => void;
    setTextures: (map: Record<string, Texture>) => void;
    setMachineIcons: (map: Record<string, Texture>) => void;
    setMachineOverlay: (type: string, config: Partial<MachineOverlay>) => void;
    setSpriteSheets: (sheets: {
      belt: Record<string, SpriteSheetEntry>;
      pipe: Record<string, SpriteSheetEntry>;
    }) => void;
    injectMachineAnchorMask: (configMap: Record<string, MachineType>) => void;
    setPortSheets: (ports: {
      belt: Record<string, SpriteSheetEntry>;
      pipe: Record<string, SpriteSheetEntry>;
    }) => void;
  }
  export function useResourcesStore(): Store<"resourcesStore", ResourcesStoreState>;
}

declare module "./stores/StorageStore.js" {
  import type { Ref, ComputedRef } from "vue";
  import type { Store } from "pinia";
  import type { MachineEntity, BeltPipeEntity } from "./global";

  interface StorageStoreState {
    width: Ref<number>;
    height: Ref<number>;
    backgroundColor: Ref<number>;
    rowCount: Ref<number>;
    colCount: Ref<number>;
    cellWidth: ComputedRef<number>;
    cellHeight: ComputedRef<number>;
    scale: Ref<number>;
    min_scale: Ref<number>;
    max_scale: Ref<number>;
    offset_position: Ref<{ x: number; y: number }>;
    max_offset: Ref<number>;
    base_step: number;
    default_belt_port_offset: number;
    default_pipe_port_offset: number;
    machines: Ref<Record<string, MachineEntity>>;
    machineObjects: Record<string, Container>;
    machineLocations: Ref<(string | null)[][]>;
    conveyors: Ref<Record<string, BeltPipeEntity>>;
    conveyorObjects: Record<string, Container>;
    conveyorLocations: Ref<(string | null)[][]>;
    pipes: Ref<Record<string, BeltPipeEntity>>;
    pipeObjects: Record<string, Container>;
    pipeLocations: Ref<(string | null)[][]>;
  }
  export function useStorageStore(): Store<"StorageStore", StorageStoreState>;
}

/* ============================================================
 *  core_container_sub 模块
 * ============================================================ */

declare module "./core_container_sub/MachineContainer.js" {
  import type { Container } from "pixi.js";
  import type { MachineEntity } from "./global";
  import type { useResourcesStore } from "./stores/ResourcesStore.js";
  import type { useStorageStore } from "./stores/StorageStore.js";

  export class MachineContainer extends Container {
    constructor(machine: MachineEntity);
    resourcesStore: ReturnType<typeof useResourcesStore>;
    storageStore: ReturnType<typeof useStorageStore>;
    machine: MachineEntity;
    cellWidth: number;
    cellHeight: number;
    machineWidth: number;
    machineHeight: number;
    portContainer: Container;
    uiContainer: Container;
    recipeContainer: Container;
    getPortOffset(
      type: "bi" | "bo" | "pi" | "po",
      dir: "up" | "down" | "left" | "right",
      cellW: number,
      cellH: number,
      factor: number,
    ): { x: number; y: number };
    createItemIcon(itemId: string, size: number): Container;
    renderBody(): void;
    renderPorts(): void;
    setPivotAndPosition(px: number, py: number): void;
    renderBorderLine(scale?: number): void;
    renderBackground(): void;
    renderOverlayTexture(): void;
    renderMachineName(): void;
    renderUI(recipe?: boolean, name?: boolean): void;
    refreshRecipeUI(): void;
    renderRecipeUI(): void;
    onScaleChange(scale: number): void;
    destroy(): void;
  }
}

declare module "./core_container_sub/BeltContainer.js" {
  import type { Container } from "pixi.js";
  import type { BeltPipeEntity } from "./global";
  export class BeltContainer extends Container {
    constructor(belt: BeltPipeEntity);
    belt: BeltPipeEntity;
    cellWidth: number;
    cellHeight: number;
  }
}

declare module "./core_container_sub/PipeContainer.js" {
  import type { Container } from "pixi.js";
  import type { BeltPipeEntity } from "./global";
  export class PipeContainer extends Container {
    constructor(pipe: BeltPipeEntity);
    pipe: BeltPipeEntity;
    cellWidth: number;
    cellHeight: number;
  }
}

declare module "./core_container_sub/PortItemContainer.js" {
  import type { MachineContainer } from "./core_container_sub/MachineContainer";
  import type { MachineEntity } from "./global";
  export class PortItemContainer extends MachineContainer {
    constructor(machine: MachineEntity);
    renderBody(): void;
    renderRecipeUI(): void;
  }
}

declare module "./core_container_sub/PortRecipeContainer.js" {
  import type { MachineContainer } from "./core_container_sub/MachineContainer";
  import type { MachineEntity } from "./global";
  export class PortRecipeContainer extends MachineContainer {
    constructor(machine: MachineEntity);
    renderBody(): void;
    renderRecipePort(force?: boolean): void;
    refreshRecipeUI(): void;
  }
}

/* ============================================================
 *  core_graphic 模块
 * ============================================================ */

declare module "./core_graphic/HoverGraphic.js" {
  import type { Graphics } from "pixi.js";
  import type { GridPosition } from "./global";
  export class HoverGraphic extends Graphics {
    constructor(
      position: GridPosition,
      size?: { gridWidth: number; gridHeight: number },
      pivot?: { x: number; y: number },
    );
    cellWidth: number;
    cellHeight: number;
    gridX: number;
    gridY: number;
  }
}

declare module "./core_graphic/IndicatorGraphic.js" {
  import type { Container } from "pixi.js";
  import type { GridPosition, MachineEntity, BeltPipeEntity } from "./global";
  export class IndicatorGraphic extends Container {
    constructor(
      position: GridPosition,
      size?: { gridWidth: number; gridHeight: number },
      pivot?: { x: number; y: number },
      is_conflict?: boolean,
      machine_entity?: MachineEntity | null,
      pipe_or_belt_entity?: BeltPipeEntity | null,
    );
    cellWidth: number;
    cellHeight: number;
    gridX: number;
    gridY: number;
    moveToGrid(position: GridPosition): void;
  }
}

declare module "./core_graphic/SelectGraphic.js" {
  import type { Graphics } from "pixi.js";
  export class SelectGraphic extends Graphics {
    constructor();
    drawSelectBox(
      width: number,
      height: number,
      baseX: number,
      baseY: number,
      fillColor?: number,
      alpha?: number,
    ): void;
  }
}

/* ============================================================
 *  core_middleware 模块
 * ============================================================ */

declare module "./core_middleware/EventHandle.js" {
  import type { MachineEntity } from "./global";
  export function setMachineClickHandler(fn: (machine: MachineEntity) => void): void;
  export function handleMachineClick(machine: MachineEntity): void;
}

declare module "./core_middleware/GridRegistry.js" {
  import type { MachineEntity, BeltPipeEntity } from "./global";
  export function getMachineByPixel(pixelX: number, pixelY: number): MachineEntity | null;
  export function getBeltByPixel(pixelX: number, pixelY: number): BeltPipeEntity | null;
  export function getPipeByPixel(pixelX: number, pixelY: number): BeltPipeEntity | null;
  export function scanGridByPixel(
    pixelStart: { startX: number; startY: number },
    pixelEnd: { endX: number; endY: number },
  ): {
    machines: Record<string, MachineEntity>;
    belts: Record<string, BeltPipeEntity>;
    pipes: Record<string, BeltPipeEntity>;
  };
}

declare module "./core_middleware/ConflictDetect.js" {
  import type { MachineEntity, BeltPipeEntity, MetaConflict } from "./global";

  export function detectOnPlaceMachine(
    grid_x: number,
    grid_y: number,
    machineType: MachineEntity,
    usePreMachine?: boolean,
  ): MetaConflict;
  export function checkMachineBounds(
    pre_machine: MachineEntity,
    gx: number,
    gy: number,
  ): boolean;
  export function detectOnPlaceFinalIsNode(
    baseGridX: number,
    baseGridY: number,
    endX: number,
    endY: number,
    pipeOrBeltMode: boolean,
    is_belt?: boolean,
  ): boolean;
  export function detectOnMoveMask(
    metaRotateMove: MetaConflict,
    gridDeltaX: number,
    gridDeltaY: number,
  ): MetaConflict;
  export function detectOnHoverMachine(gridX: number, gridY: number): MetaConflict;
  export function detectOnHoverBelt(gridX: number, gridY: number): MetaConflict;
  export function detectOnHoverPipe(gridX: number, gridY: number): MetaConflict;
  export function detectOnPlaceBatch(
    indicatorGraphics: { gridX: number; gridY: number }[],
    is_belt?: boolean,
    baseX?: number,
    baseY?: number,
    nowX?: number,
    nowY?: number,
    pipeOrBeltMode?: boolean,
  ): MetaConflict;
  export function detectOnPlaceNode(gridX: number, gridY: number, is_belt?: boolean): MetaConflict;
}

declare module "./core_middleware/IndicatorState.js" {
  import type { MachineEntity, BeltPipeEntity, MetaConflict } from "./global";

  export const S: {
    isSelectMoving: boolean;
    is_select_copy: boolean;
    pipeOrBeltMode: boolean;
    placingMachineType: string | null;
    nowPlaceNodeType: string | null;
    preMachine: MachineEntity | null;
    preNode: BeltPipeEntity | null;
    baseGrid: { x: number; y: number } | null;
    nowGrid: { x: number; y: number } | null;
    [k: string]: unknown;
  };

  export function initIndicator(): void;
  export function placeIndicatorHandle(event: unknown): void;
  export function refreshIndicator(): void;
  export function refreshSelectIndicator(): void;
  export function refreshConflictIndicator(): void;
  export function refreshIndicatorPosition(): void;
  export function refreshHandleQueue(): void;
  export function rebuildIfSelectMoving(): void;
  export function moveMasksToOffset(last_delta_x: number, last_delta_y: number): void;
  export function setSelectBaseCenterPixel(
    metaBackup: unknown,
    storageStore: unknown,
  ): void;
  export function generateConflictMask(metaConflict: MetaConflict): void;
  export function setBaseGrid(x: number, y: number): void;
  export function setNowGrid(x: number, y: number): void;
  export function hasConflict(): boolean;
  export function setPlaceIndicatorVisible(v: boolean): void;
  export function setPlaceIndicatorAlpha(a: number): void;
  export function setPlaceMode(isBelt: boolean): void;
  export function togglePipeOrBeltMode(): void;
  export function setSelectMoving(v: boolean): void;
  export function setSelectCopy(v: boolean): void;
  export function setPlacingMachineType(type: string | null): void;
  export function setNowPlaceNodeType(type: string | null): void;
  export function setPreMachine(m: MachineEntity | null): void;
  export function setPreNode(n: BeltPipeEntity | null): void;

  export {
    drawMask,
    drawMaskFromPosition,
    drawMaskSelectArea,
    drawMachineMask,
    drawBeltMask,
    drawPipeMask,
    drawSpecialMask,
  } from "../core_stage/IndicatorStage.js";
}

declare module "./core_middleware/IndicatorUtil.js" {
  export function proxyForHandle<T extends (...args: unknown[]) => unknown>(
    func: T,
    name: string,
    time_?: number,
  ): T;
  export function directionConstraint(
    gridX: number,
    gridY: number,
    startX: number,
    startY: number,
    pipeOrBeltMode: boolean,
  ): string;
  export function scanAdjacentPort(gridX: number, gridY: number): unknown;
  export function makeDebouncedDelay(
    delayMs?: number,
  ): { start: (fn: () => void) => void; cancel: () => void; isPending: () => boolean };
  export function makeClickDetector(
    delayMs?: number,
  ): { start: (fn: () => void) => void; cancel: () => void; isPending: () => boolean };
}

declare module "./core_middleware/KeyboardHandle.js" {
  export function dispatchPlaceMachineHandle(typeName: string): void;
  export function dispatchPlaceNodeHandle(typeName: string, is_belt?: boolean): void;
  export function handleKeyboardForZoom(event: KeyboardEvent): void;
  export function handleKeyboardUp(keyboardEvent: KeyboardEvent): void;
  export function handleKeyboard(keyboardEvent: KeyboardEvent): void;
}

declare module "./core_middleware/MachineUtil.js" {
  import type { MachineEntity } from "./global";

  export function getMachineById(id: string): MachineEntity | undefined;
  export function getMachineByGrid(gridX: number, gridY: number): MachineEntity | null;
  export function getId(machine: MachineEntity): string;
  export function getType(machine: MachineEntity): string;
  export function getName(machine: MachineEntity): string | undefined;
  export function getSize(machine: MachineEntity): [number, number];
  export function getMask(machine: MachineEntity): string[][] | null;
  export function getAnchor(machine: MachineEntity): { x: number; y: number }[];
  export function getRecipeIds(machine: MachineEntity): string[];
  export function getRotation(machine: MachineEntity): number;
  export function getPortOffsetIndex(machine: MachineEntity): number;
  export function getGridPosition(machine: MachineEntity): { gridX: number; gridY: number };
  export function getPixelPosition(machine: MachineEntity): { x: number; y: number };
  export function getCenterPixel(machine: MachineEntity): { centerX: number; centerY: number };
  export function getNowRecipe(machine: MachineEntity): string | undefined;
  export function setNowRecipe(machine: MachineEntity, recipeId: string): void;
  export function getNowMode(machine: MachineEntity): string | undefined;
  export function setNowMode(machine: MachineEntity, mode: string): void;
  export function getPortRecipeIcon(machine: MachineEntity, key: string): string | null | undefined;
  export function setPortRecipeIcon(machine: MachineEntity, key: string, value: string | null): void;
  export function getMachineObject(id: string): Container | undefined;
  export function getAllMachines(): Record<string, MachineEntity>;
  export function getAllMachineObjects(): Record<string, Container>;
}

declare module "./core_middleware/MaskUtil.js" {
  import type { ParsedMaskCell } from "./global";
  export const portRotateMap: Record<string, string>;
  export function parseMaskCell(cell: string): ParsedMaskCell | null;
  export function buildMaskCell(type: string, dir: string, portId?: string): string;
  export function rotateMask(mask: string[][]): string[][];
}

declare module "./core_middleware/PositionConvert.js" {
  export function gridToPixel(x: number, y: number): { x: number; y: number };
  export function pixelToGrid(x: number, y: number): { gridX: number; gridY: number };
  export function pixelToGridNoneOffset(x: number, y: number): { gridX: number; gridY: number };
  export function sizeGridToPixel(width: number, height: number): { width: number; height: number };
  export function getCellSize(): { width: number; height: number };
}

declare module "./core_middleware/UndoProxy.js" {}

/* ============================================================
 *  core_storage 模块
 * ============================================================ */

declare module "./core_storage/BeltStorage.js" {
  import type { BeltPipeEntity } from "./global";
  import type { Container } from "pixi.js";
  export function saveBelt(belt: BeltPipeEntity, belt_container: Container): void;
  export function dropBelt(belt: BeltPipeEntity): Container;
  export function findBeltNearBy(belt: BeltPipeEntity): BeltPipeEntity[];
  export function getBeltByPosition(grid_x: number, grid_y: number): BeltPipeEntity | null;
}

declare module "./core_storage/MachineStorage.js" {
  import type { MachineEntity } from "./global";
  import type { Container } from "pixi.js";
  export function saveMachine(machine: MachineEntity, machine_container: Container): void;
  export function dropMachine(machine: MachineEntity): Container;
  export function getMachineByPosition(grid_x: number, grid_y: number): MachineEntity | null;
  export function getMachineGridPosition(machine: MachineEntity): { gridX: number; gridY: number };
  export function getMachineMaskTypeByPosition(grid_x: number, grid_y: number): string | undefined;
  export function mapMachineArea(
    machine: MachineEntity,
    func: (x: number, y: number, maskType: string) => void,
    use_center?: boolean,
  ): void;
  export function mapMachineAreaWithType(
    machine_type: string,
    func: (x: number, y: number, maskType: string) => void,
  ): void;
  export function getLeftTopPosition(machine: MachineEntity): { leftTopX: number; leftTopY: number };
  export function getMachinePixelSize(machine: MachineEntity): {
    machineWidth: number;
    machineHeight: number;
  };
}

declare module "./core_storage/PipeStorage.js" {
  import type { BeltPipeEntity } from "./global";
  import type { Container } from "pixi.js";
  export function savePipe(pipe: BeltPipeEntity, pipe_container: Container): void;
  export function dropPipe(pipe: BeltPipeEntity): Container;
  export function findPipeNearBy(pipe: BeltPipeEntity): BeltPipeEntity[];
  export function getPipeByPosition(grid_x: number, grid_y: number): BeltPipeEntity | null;
}

/* ============================================================
 *  core_stage 模块
 * ============================================================ */

declare module "./core_stage/BeltStage.js" {
  import type { BeltPipeEntity } from "./global";
  import type { Container } from "pixi.js";
  export function drawBelt(belt: BeltPipeEntity): Container;
  export function dropDrawBelt(belt_container: Container): void;
}

declare module "./core_stage/IndicatorStage.js" {
  import type { Container } from "pixi.js";
  import type {
    GridPosition,
    MachineEntity,
    BeltPipeEntity,
    MetaConflict,
  } from "./global";

  export function drawMask(
    position: GridPosition,
    conflict?: boolean,
    pipe_or_belt_entity?: BeltPipeEntity | null,
  ): void;
  export function drawSpecialMask(
    position: GridPosition,
    size: { gridWidth: number; gridHeight: number },
    pivot: { x: number; y: number },
    is_conflict?: boolean,
    machine_entity?: MachineEntity | null,
  ): void;
  export function drawBatchMask(positions: GridPosition[]): void;
  export function drawMaskFromPosition(
    start_position: { startX: number; startY: number },
    end_position: { endX: number; endY: number },
    change_mode?: boolean,
    skip_first?: boolean,
  ): { gridX: number; gridY: number }[];
  export function drawSelectBox(): void;
  export function drawMachineMask(
    machines: Record<string, MachineEntity>,
    now_keys: unknown,
    is_conflict?: boolean,
  ): void;
  export function drawBeltMask(
    belts: Record<string, BeltPipeEntity>,
    now_keys: unknown,
    is_conflict?: boolean,
  ): void;
  export function drawPipeMask(
    pipes: Record<string, BeltPipeEntity>,
    now_keys: unknown,
    is_conflict?: boolean,
  ): void;
  export function drawMaskSelectArea(
    start_position: { startX: number; startY: number },
    end_position: { endX: number; endY: number },
    now_keys: unknown,
  ): void;
  export function drawConflictMaskOnMove(metaConflict: MetaConflict): void;
  export function drawHoverIndicator(entity: MachineEntity | BeltPipeEntity): Container;
}

declare module "./core_stage/MachineStage.js" {
  import type { MachineEntity } from "./global";
  import type { Container } from "pixi.js";
  export function setupMachineScaleListener(): void;
  export function drawMachine(machine: MachineEntity): Container;
  export function dropDrawMachine(machine_container: Container): void;
}

declare module "./core_stage/PipeStage.js" {
  import type { BeltPipeEntity } from "./global";
  import type { Container } from "pixi.js";
  export function drawPipe(pipe: BeltPipeEntity): Container;
  export function dropDrawPipe(pipe_container: Container): void;
}

declare module "./core_stage/ScaleStage.js" {
  export function setPosition(
    x: number,
    y: number,
  ): { confirmOffsetX: number; confirmOffsetY: number };
  export function setScale(scale: number): void;
  export function resetScale(): void;
  export function resetPosition(): void;
  export function setBackgroundGraphic(graphic: unknown): void;
}

declare module "./core_stage/SimInit.js" {
  export function drawGridLines(): void;
  export function drawHitArea(): void;
}

declare module "./core_stage/SimStage.js" {
  import type { Application, Container } from "pixi.js";
  export const app: Application;
  export const rootStage: Container;
  export const viewportContainer: Container;
  export const indicatorContainer: Container;
  export const machineRootContainer: Container;
  export const pipeRootContainer: Container;
  export const beltRootContainer: Container;
  export const backgroundContainer: Container;
}

/* ============================================================
 *  core_sub 模块
 * ============================================================ */

declare module "./core_sub/Belt.js" {
  import type { BeltPipeEntity } from "./global";
  import type { Container } from "pixi.js";

  export function createBelt(typename: string): BeltPipeEntity;
  export function createBeltNode(type: string): BeltPipeEntity;
  export function placeBelt(
    belt: BeltPipeEntity,
    x: number,
    y: number,
    in_dir: string,
    out_dir: string,
    is_copy?: boolean,
  ): Container;
  export function placeBeltNode(belt: BeltPipeEntity, x: number, y: number): Container;
  export function rotateBeltNode(belt: BeltPipeEntity): void;
  export function rotateBelt(belt: BeltPipeEntity): void;
  export function rotateBeltByCenter(belt: BeltPipeEntity, x: number, y: number): void;
  export function deleteBelt(belt: BeltPipeEntity): void;
  export function placeBatchBelt(
    start_position: { startX: number; startY: number },
    end_position: { endX: number; endY: number },
    start_belt_dir_in?: string | null,
    end_belt_dir_out?: string | null,
    change_mode?: boolean,
    skip_first?: boolean,
    skip_last?: boolean,
  ): void;
  export function deleteBatchBelt(belt: BeltPipeEntity): BeltPipeEntity[];
}

declare module "./core_sub/Drag.js" {
  export function handleDragStart(event: { screen: { x: number; y: number } }): void;
  export function handleDragMove(event: { screen: { x: number; y: number } }): void;
  export function handleDragEnd(event: unknown): void;
}

declare module "./core_sub/Indicator.js" {
  export function onStartPlaceBelt(name?: unknown): void;
  export function onStartPlacePipe(name?: unknown): void;
  export function onStartPlaceMachine(typeName: string): void;
  export function onStartSelect(name?: unknown): void;
  export function onCancel(): void;
  export function onStartSelectMove(name?: unknown, is_copy?: boolean): void;
  export function onStartSelectRotate(name?: unknown): void;
  export function onStartSelectDelete(): void;
  export function onStartPlaceChangeMode(): void;
  export function onStartSelectCopy(name?: unknown): void;
  export function onStartPlaceMachineRotate(): void;
  export function onStartPlaceNode(typeName: string, is_belt?: boolean): void;
  export function onStartPlaceNodeRotate(): void;

  export function onMouseMove(event: unknown): void;
  export function onMouseDown(event: unknown): void;
  export function onMouseUp(event: unknown): void;
  export function onMouseOut(event: unknown): void;
  export function onMouseOver(event: unknown): void;
  export function initIndicator(): void;
}

declare module "./core_sub/Machine.js" {
  import type { MachineEntity } from "./global";
  import type { Container } from "pixi.js";

  export function createMachine(typename: string): MachineEntity;
  export function placeMachine(
    machine: MachineEntity,
    x: number,
    y: number,
    is_copy?: boolean,
  ): Container;
  export function deleteMachine(machine: MachineEntity): MachineEntity;
  export function rotateMachine(machine: MachineEntity): void;
  export function rotateMachineByCenter(machine: MachineEntity, x: number, y: number): void;
}

declare module "./core_sub/Pipe.js" {
  import type { BeltPipeEntity } from "./global";
  import type { Container } from "pixi.js";

  export function createPipe(typename: string): BeltPipeEntity;
  export function createPipeNode(type: string): BeltPipeEntity;
  export function placePipe(
    pipe: BeltPipeEntity,
    x: number,
    y: number,
    in_dir: string,
    out_dir: string,
    is_copy?: boolean,
  ): Container;
  export function placePipeNode(pipe: BeltPipeEntity, x: number, y: number): Container;
  export function rotatePipeNode(pipe: BeltPipeEntity): void;
  export function rotatePipe(pipe: BeltPipeEntity): void;
  export function rotatePipeByCenter(pipe: BeltPipeEntity, x: number, y: number): void;
  export function deletePipe(pipe: BeltPipeEntity): void;
  export function placeBatchPipe(
    start_position: { startX: number; startY: number },
    end_position: { endX: number; endY: number },
    start_pipe_dir_in?: string | null,
    end_pipe_dir_out?: string | null,
    change_mode?: boolean,
    skip_first?: boolean,
    skip_last?: boolean,
  ): void;
  export function deleteBatchPipe(pipe: BeltPipeEntity): BeltPipeEntity[];
}

declare module "./core_sub/Scale.js" {
  export function onWheelChange(event: {
    screen: { x: number; y: number };
    deltaY: number;
  }): void;
  export function moveViewLeft(): void;
  export function moveViewRight(): void;
  export function moveViewUp(): void;
  export function moveViewDown(): void;
}

/* ============================================================
 *  global 类型补充声明
 * ============================================================ */

declare global {
  interface Window {
    __PIXI_APP__?: Application;
  }
}

export {};
