<template>
    <div class="virtual-tree-container" ref="treeContainer">
        <div class="virtual-tree-search" v-if="searchable">
            <t-input v-model="searchText" placeholder="搜索" clearable @change="handleSearch">
                <template #suffix-icon>
                    <t-icon name="search" />
                </template>
            </t-input>
        </div>

        <div class="virtual-tree-content" ref="treeContent" @scroll="handleScroll">
            <!-- 用于撑开滚动高度的占位元素 -->
            <div class="virtual-scroll-phantom" :style="{ height: totalHeight + 'px' }"></div>

            <!-- 实际渲染的可视区域 -->
            <div class="virtual-scroll-content" :style="{ transform: `translateY(${offsetY}px)` }">
                <div v-for="item in visibleData" :key="item.id" class="tree-node"
                    :class="{ 'tree-node-selected': selectedKeys.includes(item.rawData.areacode) }" :style="{
                        paddingLeft: `${item.level * 20 + 10}px`,
                        height: `${itemHeight}px`,
                        lineHeight: `${itemHeight}px`
                    }">
                    <!-- 展开/收起图标 -->
                    <span v-if="item.children && item.children.length > 0" class="tree-node-arrow"
                        @click.stop="toggleExpand(item)">
                        <t-icon :name="item.expanded ? 'chevron-down' : 'chevron-right'" />
                    </span>
                    <span v-else class="tree-node-placeholder"></span>

                    <!-- 勾选框(多选模式) -->
                    <t-checkbox v-if="multiple" :checked="selectedKeys.includes(item.rawData.areacode)"
                        @change="() => toggleSelect(item)" class="tree-node-checkbox" />

                    <!-- 节点内容 -->
                    <span class="tree-node-content" @click="handleNodeClick(item)">
                        {{ item.rawData.areaname }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'VirtualTree',
    props: {
        data: {
            type: Array,
            required: true
        },
        value: {
            type: [String, Array],
            default: () => []
        },
        searchable: {
            type: Boolean,
            default: true
        },
        placeholder: {
            type: String,
            default: '请选择'
        },
        multiple: {
            type: Boolean,
            default: false
        },
        height: {
            type: [Number, String],
            default: 400
        }
    },
    data() {
        return {
            flattenedData: [], // 扁平化后的数据
            visibleData: [], // 可视区域数据
            scrollTop: 0, // 滚动位置
            itemHeight: 32, // 每项高度
            bufferSize: 5, // 缓冲区大小
            searchText: '', // 搜索文本
            expandedKeys: new Set(), // 展开的节点
            selectedKeys: Array.isArray(this.value) ? [...this.value] : (this.value ? [this.value] : []), // 选中的节点
            offsetY: 0, // Y轴偏移量
            containerHeight: 400, // 容器高度，默认值，会在mounted中更新
            totalHeight: 0, // 总高度
            uniqueId: 0, // 用于生成唯一ID
        };
    },
    computed: {
        visibleCount() {
            return Math.ceil(this.containerHeight / this.itemHeight) + this.bufferSize * 2;
        },
        startIndex() {
            return Math.max(0, Math.floor(this.scrollTop / this.itemHeight) - this.bufferSize);
        },
        endIndex() {
            return Math.min(this.flattenedData.length - 1, this.startIndex + this.visibleCount - 1);
        },
        selectedNodes() {
            return this.flattenedData.filter(item => this.selectedKeys.includes(item.rawData.areacode));
        }
    },
    watch: {
        data: {
            handler() {
                this.initFlattenedData();
                this.updateVisibleData();
            },
            immediate: true,
            deep: true
        },
        value: {
            handler(newVal) {
                if (Array.isArray(newVal)) {
                    this.selectedKeys = [...newVal];
                } else if (newVal) {
                    this.selectedKeys = [newVal];
                } else {
                    this.selectedKeys = [];
                }
            },
            immediate: true
        },
        height: {
            handler(newVal) {
                this.updateContainerHeight();
            },
            immediate: true
        }
    },
    mounted() {
        this.$nextTick(() => {
            this.updateContainerHeight();
            this.initFlattenedData();
            this.updateVisibleData();
            window.addEventListener('resize', this.handleResize);
        });
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.handleResize);
    },
    methods: {
        // 更新容器高度
        updateContainerHeight() {
            this.$nextTick(() => {
                if (this.$refs.treeContent) {
                    const height = typeof this.height === 'number' ? this.height : parseInt(this.height);
                    this.$refs.treeContent.style.height = `${height}px`;
                    this.containerHeight = height;
                    this.updateVisibleData();
                }
            });
        },

        // 生成唯一ID
        generateId() {
            return `node-${++this.uniqueId}`;
        },

        // 初始化扁平化数据
        initFlattenedData() {
            this.flattenedData = [];
            this.flattenTreeData(this.data, 0);
            this.calculateTotalHeight();
        },

        // 递归扁平化树数据
        flattenTreeData(data, level, parent = null) {
            if (!data || !data.length) return;

            data.forEach(item => {
                const nodeId = this.generateId();
                const node = {
                    id: nodeId,
                    parent,
                    level,
                    expanded: this.expandedKeys.has(item.areacode),
                    visible: true,
                    rawData: item,
                    children: item.children && item.children.length > 0 ? item.children.map(child => child.areacode) : []
                };

                this.flattenedData.push(node);

                // 如果节点展开且有子节点，继续扁平化子节点
                if (node.expanded && item.children && item.children.length > 0) {
                    this.flattenTreeData(item.children, level + 1, nodeId);
                }
            });
        },

        // 计算总高度
        calculateTotalHeight() {
            // 只计算可见节点的高度
            let visibleCount = 0;
            this.flattenedData.forEach(item => {
                if (item.visible) {
                    visibleCount++;
                }
            });
            this.totalHeight = visibleCount * this.itemHeight;
        },

        // 更新可视区域数据
        updateVisibleData() {
            // 过滤出可见的节点
            const visibleNodes = this.flattenedData.filter(item => item.visible);

            // 计算总高度
            this.totalHeight = visibleNodes.length * this.itemHeight;

            // 获取可视区域的节点
            const start = this.startIndex;
            const end = Math.min(start + this.visibleCount, visibleNodes.length);

            this.visibleData = visibleNodes.slice(start, end);
            this.offsetY = start * this.itemHeight;
        },

        // 处理滚动事件
        handleScroll(e) {
            this.scrollTop = e.target.scrollTop;
            this.updateVisibleData();
        },

        // 处理窗口大小变化
        handleResize() {
            this.updateContainerHeight();
        },

        // 切换节点展开状态
        toggleExpand(item) {
            const nodeKey = item.rawData.areacode;

            if (this.expandedKeys.has(nodeKey)) {
                this.expandedKeys.delete(nodeKey);
            } else {
                this.expandedKeys.add(nodeKey);
            }

            // 重新扁平化数据
            this.initFlattenedData();
            this.updateVisibleData();
        },

        // 切换节点选中状态
        toggleSelect(item) {
            const nodeKey = item.rawData.areacode;

            const index = this.selectedKeys.indexOf(nodeKey);
            if (index > -1) {
                this.selectedKeys.splice(index, 1);
            } else {
                if (this.multiple) {
                    this.selectedKeys.push(nodeKey);
                } else {
                    this.selectedKeys = [nodeKey];
                }
            }

            // 触发change事件
            this.$emit('input', this.multiple ? [...this.selectedKeys] : this.selectedKeys[0] || '');
            this.$emit('change', this.multiple ? [...this.selectedKeys] : this.selectedKeys[0] || '');
        },

        // 处理节点点击
        handleNodeClick(item) {
            // 在单选模式下点击节点即选择，多选模式下点击内容区域也视为选择
            if (!this.multiple) {
                this.toggleSelect(item);
            } else {
                // 多选模式下，点击文本区域也触发选择
                this.toggleSelect(item);
            }
        },

        // 处理搜索
        handleSearch() {
            if (!this.searchText) {
                // 恢复所有节点可见
                this.flattenedData.forEach(item => {
                    item.visible = true;
                });
            } else {
                // 搜索逻辑
                const searchValue = this.searchText.toLowerCase();

                // 先将所有节点设为不可见
                this.flattenedData.forEach(item => {
                    item.visible = false;
                });

                // 查找匹配的节点及其父节点路径
                this.flattenedData.forEach(item => {
                    if (item.rawData.areaname.toLowerCase().includes(searchValue)) {
                        item.visible = true;

                        // 设置父节点路径可见
                        let parentId = item.parent;
                        while (parentId) {
                            const parentNode = this.flattenedData.find(node => node.id === parentId);
                            if (parentNode) {
                                parentNode.visible = true;
                                parentNode.expanded = true;
                                this.expandedKeys.add(parentNode.rawData.areacode);
                                parentId = parentNode.parent;
                            } else {
                                break;
                            }
                        }

                        // 如果有子节点且当前节点展开，设置子节点可见
                        if (item.expanded && item.children && item.children.length) {
                            this.setChildrenVisible(item.children);
                        }
                    }
                });
            }

            // 重新计算可见节点并更新
            this.calculateTotalHeight();
            this.updateVisibleData();
        },

        // 设置子节点可见
        setChildrenVisible(childrenKeys) {
            childrenKeys.forEach(key => {
                const childNode = this.flattenedData.find(node => node.rawData.areacode === key);
                if (childNode) {
                    childNode.visible = true;

                    if (childNode.expanded && childNode.children && childNode.children.length) {
                        this.setChildrenVisible(childNode.children);
                    }
                }
            });
        },

        // 清空选择
        clear() {
            this.selectedKeys = [];
            this.$emit('input', this.multiple ? [] : '');
            this.$emit('change', this.multiple ? [] : '');
        },

        // 获取选中的节点数据
        getSelectedNodes() {
            return this.selectedNodes.map(node => ({
                label: node.rawData.areaname,
                value: node.rawData.areacode
            }));
        }
    }
};
</script>

<style scoped>
.virtual-tree-container {
    width: 100%;
    border-radius: 3px;
    background-color: #fff;
}

.virtual-tree-search {
    padding: 8px;
    border-bottom: 1px solid #eee;
}

.virtual-tree-content {
    height: 400px;
    overflow-y: auto;
    position: relative;
}

.virtual-scroll-phantom {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    z-index: -1;
}

.virtual-scroll-content {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    min-height: 100%;
}

.tree-node {
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
    transition: background-color 0.2s;
}

.tree-node:hover {
    background-color: #f5f5f5;
}

.tree-node-selected {
    background-color: #e6f7ff;
}

.tree-node-arrow {
    display: inline-block;
    width: 20px;
    text-align: center;
    cursor: pointer;
}

.tree-node-placeholder {
    display: inline-block;
    width: 20px;
}

.tree-node-checkbox {
    margin-right: 5px;
}

.tree-node-content {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>