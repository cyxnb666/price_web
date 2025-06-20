<template>
    <t-loading :loading="loading" text="加载中...">
        <t-card :bordered="false" class="list-card-container">
            <div class="detail-container">
                <div class="section">
                    <div class="section-title">
                        <span class="section-title-marker"></span>
                        <span>基础信息</span>
                    </div>

                    <div>
                        <t-row :gutter="[16, 16]">
                            <t-col :span="4">
                                <div class="field-item">
                                    <label>行政区划</label>
                                    <t-input v-model="basicInfo.areaname" disabled placeholder="" />
                                </div>
                            </t-col>
                            <t-col :span="4">
                                <div class="field-item">
                                    <label>品种大类</label>
                                    <t-input v-model="basicInfo.varietyName" disabled placeholder="" />
                                </div>
                            </t-col>
                            <t-col :span="4">
                                <div class="field-item">
                                    <label>上报地点</label>
                                    <t-input v-model="basicInfo.reportingLocation" disabled placeholder="" />
                                </div>
                            </t-col>
                        </t-row>

                        <t-row :gutter="[16, 16]">
                            <t-col :span="4">
                                <div class="field-item">
                                    <label>价格日期</label>
                                    <t-input v-model="basicInfo.collectDate" disabled placeholder="" />
                                </div>
                            </t-col>
                            <t-col :span="4">
                                <div class="field-item">
                                    <label>上报时间</label>
                                    <t-input v-model="basicInfo.collectTime" disabled placeholder="" />
                                </div>
                            </t-col>
                            <t-col :span="4">
                                <div class="field-item">
                                    <label>采价员</label>
                                    <t-input v-model="basicInfo.collectorName" disabled placeholder="" />
                                </div>
                            </t-col>
                        </t-row>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">
                        <span class="section-title-marker"></span>
                        <span>采价信息</span>
                    </div>

                    <t-tabs v-model="activeTab" @change="handleTabChange">
                        <t-tab-panel v-for="(item, index) in varietyTabs" :key="index" :value="item.value"
                            :label="item.label">
                            <t-loading :loading="tabLoading" text="加载中...">
                                <div class="price-info">
                                    <t-table :data="currentTabData.priceData" :columns="priceColumns" rowKey="id"
                                        bordered>
                                        <template #specsType="{ row }">
                                            <span>{{ formatSpecsType(row.specsType) }}</span>
                                        </template>
                                    </t-table>

                                    <div class="evidence-section">
                                        <div class="evidence-title">价格佐证凭据</div>
                                        <div class="credentials-container">
                                            <!-- 图片文件 -->
                                            <t-image-viewer v-for="(file, fileIndex) in currentTabData.files.images"
                                                :key="fileIndex" :default-index="fileIndex"
                                                :images="currentTabData.files.imageUrls">
                                                <template #trigger="{ open }">
                                                    <div
                                                        class="tdesign-demo-image-viewer__ui-image tdesign-demo-image-viewer__base">
                                                        <img :alt="file.fileName" :src="file.fileUrl"
                                                            class="tdesign-demo-image-viewer__ui-image--img" />
                                                        <div class="tdesign-demo-image-viewer__ui-image--hover"
                                                            @click="open">
                                                            <span><t-icon name="browse" size="1.4em" /> 预览</span>
                                                        </div>
                                                    </div>
                                                </template>
                                            </t-image-viewer>

                                            <!-- 视频文件 -->
                                            <div v-for="(file, fileIndex) in currentTabData.files.videos"
                                                :key="`video-${fileIndex}`" class="credential-item">
                                                <div class="image-container">
                                                    <div class="video-placeholder">
                                                        <t-icon name="cloud-download" class="downVideo"
                                                            @click="downloadFile(file.fileId, file.fileName)" />
                                                        <video :src="file.fileUrl" controls
                                                            controlsList="nodownload"></video>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- 其他类型文件 -->
                                            <div v-for="(file, fileIndex) in currentTabData.files.others"
                                                :key="`other-${fileIndex}`" class="credential-item">
                                                <div class="file-container" @click="handleFileClick(file)">
                                                    <div class="file-icon">
                                                        <i class="file-type">{{ file.fileSuffix.toUpperCase() }}</i>
                                                    </div>
                                                    <div class="file-name">{{ file.fileName }}</div>
                                                </div>
                                            </div>

                                            <!-- 如果没有文件，显示占位符 -->
                                            <div v-if="currentTabData.files.images.length === 0 && currentTabData.files.videos.length === 0 && currentTabData.files.others.length === 0"
                                                class="credential-item">
                                                <div class="image-placeholder">
                                                    <div class="placeholder-x"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </t-loading>
                        </t-tab-panel>
                    </t-tabs>
                </div>

                <div class="back-button-container">
                    <t-button theme="default" @click="goBack">返回</t-button>
                </div>
            </div>
        </t-card>
    </t-loading>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'PricingMarketDetail',
    props: {
        id: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            loading: false,
            tabLoading: false,
            activeTab: '',
            basicInfo: {
                areaname: '',
                varietyName: '',
                reportingLocation: '',
                collectDate: '',
                collectTime: '',
                collectorName: '',
            },
            varietyTabs: [],
            currentTabData: {
                priceData: [],
                files: {
                    images: [],
                    imageUrls: [],
                    videos: [],
                    others: [],
                },
            },
            priceColumns: [
                { title: '计价方式', colKey: 'specsType' },
                { title: '规格', colKey: 'fvSpecs' },
                { title: '行情价', colKey: 'unitPriceStr' },
            ],
        };
    },
    mounted() {
        this.fetchData();
    },
    methods: {
        async fetchData() {
            this.loading = true;

            const params = {
                condition: {
                    primaryKey: this.id,
                },
            };

            try {
                const res = await this.$request.post('/web/market/getFruitMarket', params);
                if (res.retCode === 200) {
                    const data = res.retData;
                    console.log('采价行情详情数据:', data);

                    // 设置基础信息
                    this.basicInfo = {
                        areaname: data.areaname || '',
                        varietyName: data.varietyName || '',
                        reportingLocation: data.reportingLocation || '',
                        collectDate: data.collectDate || '',
                        collectTime: data.collectTime || '',
                        collectorName: data.collectorName || '',
                    };

                    this.varietyTabs = [];
                    if (data.collectCategories && data.collectCategories.length > 0) {
                        for (let i = 0; i < data.collectCategories.length; i++) {
                            const category = data.collectCategories[i];
                            this.varietyTabs.push({
                                label: category.categoryName || `品类${i + 1}`,
                                value: `category${i + 1}`,
                                collectCategoryId: category.collectCategoryId,
                            });
                        }
                    }

                    if (this.varietyTabs.length > 0) {
                        this.activeTab = this.varietyTabs[0].value;
                        await this.fetchTabDetailData(this.varietyTabs[0].collectCategoryId);
                    }
                } else {
                    this.$message.error(res.retMsg || '获取详情数据失败');
                }
            } catch (e) {
                console.error('API error:', e);
                this.$message.error('获取详情数据失败');
            } finally {
                this.loading = false;
            }
        },

        async fetchTabDetailData(collectCategoryId) {
            if (!collectCategoryId) return;

            this.tabLoading = true;

            const params = {
                condition: {
                    primaryKey: collectCategoryId,
                },
            };

            try {
                console.log('调用getFruitMarketCategory接口，参数:', params);
                const res = await this.$request.post('/weixin/market/getFruitMarketCategory', params);

                if (res.retCode === 200) {
                    const data = res.retData;
                    console.log('getFruitMarketCategory返回数据:', data);

                    // 重置当前tab数据
                    this.currentTabData = {
                        priceData: data.specss || [],
                        files: {
                            images: [],
                            imageUrls: [],
                            videos: [],
                            others: [],
                        },
                    };

                    // 处理价格佐证凭据文件
                    if (data.priceFiles && data.priceFiles.length > 0) {
                        await this.processFilesForCurrentTab(data.priceFiles);
                    }

                } else {
                    this.$message.error(res.retMsg || '获取tab详情数据失败');
                }
            } catch (e) {
                console.error('fetchTabDetailData API error:', e);
                this.$message.error('获取tab详情数据失败');
            } finally {
                this.tabLoading = false;
            }
        },

        async handleTabChange(value) {
            console.log('Tab changed to:', value);

            // 找到对应的tab数据
            const targetTab = this.varietyTabs.find(tab => tab.value === value);
            if (targetTab && targetTab.collectCategoryId) {
                await this.fetchTabDetailData(targetTab.collectCategoryId);
            }
        },

        // 处理单个标签页的文件
        async processFilesForTab(tabData, priceFiles) {
            for (const file of priceFiles) {
                // 获取文件预览URL
                const fileUrl = await this.fetchFileUrl(file.fileId);
                const fileWithUrl = {
                    ...file,
                    fileUrl: fileUrl,
                };

                // 根据文件类型分类
                if (this.isImageFile(file.fileSuffix)) {
                    tabData.files.images.push(fileWithUrl);
                    tabData.files.imageUrls.push(fileUrl);
                } else if (this.isVideoFile(file.fileSuffix)) {
                    tabData.files.videos.push(fileWithUrl);
                } else {
                    tabData.files.others.push(fileWithUrl);
                }
            }
        },

        // 处理当前tab的文件
        async processFilesForCurrentTab(priceFiles) {
            for (const file of priceFiles) {
                // 获取文件预览URL
                const fileUrl = await this.fetchFileUrl(file.fileId);
                const fileWithUrl = {
                    ...file,
                    fileUrl: fileUrl,
                };

                // 根据文件类型分类
                if (this.isImageFile(file.fileSuffix)) {
                    this.currentTabData.files.images.push(fileWithUrl);
                    this.currentTabData.files.imageUrls.push(fileUrl);
                } else if (this.isVideoFile(file.fileSuffix)) {
                    this.currentTabData.files.videos.push(fileWithUrl);
                } else {
                    this.currentTabData.files.others.push(fileWithUrl);
                }
            }
        },

        // 格式化计价方式
        formatSpecsType(specsType) {
            const specsTypeMap = {
                'DIAMETER': '按果径',
                'WEIGHT': '按重量',
                'WHOLE': '统果'
            };
            return specsTypeMap[specsType] || specsType;
        },

        // 获取文件预览URL
        async fetchFileUrl(fileId) {
            if (!fileId) return null;

            try {
                const params = {
                    condition: {
                        primaryKey: fileId,
                    },
                };

                const response = await this.$request.post('/file/preview', params, {
                    responseType: 'arraybuffer',
                });

                const blob = new Blob([response.data]);
                const objectUrl = URL.createObjectURL(blob);
                return objectUrl;
            } catch (error) {
                console.error('Error fetching file URL:', error);
                return null;
            }
        },

        // 判断文件是否为图片
        isImageFile(fileSuffix) {
            if (!fileSuffix) return false;
            const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
            return imageExtensions.includes(fileSuffix.toLowerCase());
        },

        // 判断文件是否为视频
        isVideoFile(fileSuffix) {
            if (!fileSuffix) return false;
            const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'];
            return videoExtensions.includes(fileSuffix.toLowerCase());
        },

        handleFileClick(file) {
            if (!file.fileUrl) return;

            if (file.fileSuffix && file.fileSuffix.toLowerCase() === 'pdf') {
                this.downloadFile(file.fileId, file.fileName);
            } else if (this.isDocumentFile(file.fileSuffix)) {
                this.downloadFile(file.fileId, file.fileName);
            } else {
                this.viewFile(file.fileUrl);
            }
        },

        isDocumentFile(fileSuffix) {
            if (!fileSuffix) return false;
            const docExtensions = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];
            return docExtensions.includes(fileSuffix.toLowerCase());
        },

        // 查看文件
        viewFile(url) {
            if (url) {
                window.open(url, '_blank');
            }
        },

        // 下载文件
        downloadFile(fileId, fileName) {
            console.log('Download file:', fileId, fileName);
            if (fileId) {
                const params = {
                    condition: {
                        primaryKey: fileId,
                    },
                };
                this.$request.post('/file/preview', params, {
                    responseType: 'arraybuffer',
                })
                    .then((response) => {
                        const blob = new Blob([response.data]);
                        const url = window.URL.createObjectURL(blob);
                        let link = document.createElement('a');
                        link.style.display = 'none';
                        link.href = url;
                        link.setAttribute('download', fileName);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    });
            }
        },

        goBack() {
            this.$router.back();
        },
    },
});
</script>

<style lang="less" scoped>
.detail-container {
    // padding: 20px;
}

.section {
    margin-bottom: 40px;
}

.section-title {
    display: flex;
    align-items: center;
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 20px;

    .section-title-marker {
        width: 4px;
        height: 16px;
        background-color: var(--td-brand-color);
        margin-right: 8px;
    }
}

.field-item {
    display: flex;
    flex-direction: column;
    margin-bottom: 16px;

    label {
        font-size: 14px;
        color: var(--td-text-color-secondary);
        margin-bottom: 8px;
    }
}

.price-info {
    margin-top: 20px;
}

.evidence-section {
    margin-top: 24px;
}

.evidence-title {
    font-weight: bold;
    margin-bottom: 16px;
}

.credentials-container {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-top: 16px;
}

.credential-item {
    width: 120px;
    height: 120px;
    position: relative;
}

video {
    height: 100%;
    width: 100%;
}

.image-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #e5e5e5;
    overflow: hidden;
    cursor: pointer;
}

.file-container {
    width: 100%;
    height: 100%;
    border: 1px solid #e5e5e5;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
    cursor: pointer;
}

.file-icon {
    width: 60px;
    height: 60px;
    background-color: #e0e0e0;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;
}

.file-type {
    font-style: normal;
    font-size: 12px;
    font-weight: bold;
}

.file-name {
    font-size: 12px;
    text-align: center;
    padding: 0 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
}

.image-placeholder {
    width: 100%;
    height: 100%;
    border: 1px dashed #ccc;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
    position: relative;
}

.placeholder-x {
    position: relative;
    width: 100%;
    height: 100%;

    &:before,
    &:after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 80%;
        height: 1px;
        background-color: #ccc;
    }

    &:before {
        transform: translate(-50%, -50%) rotate(45deg);
    }

    &:after {
        transform: translate(-50%, -50%) rotate(-45deg);
    }
}

.video-placeholder {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;

    .downVideo {
        height: 20px;
        position: absolute;
        right: 0;
        top: 0px;
        color: red;
        font-size: 20px;
        z-index: 999;
    }
}

.back-button-container {
    display: flex;
    justify-content: center;
    bottom: 0;
    margin-top: 40px;
    padding: 16px 0;
    z-index: 10;
}

/* 图片查看器样式 */
.tdesign-demo-image-viewer__ui-image {
    width: 100%;
    height: 100%;
    display: inline-flex;
    position: relative;
    justify-content: center;
    align-items: center;
    border-radius: var(--td-radius-small);
    overflow: hidden;
}

.tdesign-demo-image-viewer__ui-image--hover {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    left: 0;
    top: 0;
    opacity: 0;
    background-color: rgba(0, 0, 0, 0.6);
    color: var(--td-text-color-anti);
    line-height: 22px;
    transition: 0.2s;
}

.tdesign-demo-image-viewer__ui-image:hover .tdesign-demo-image-viewer__ui-image--hover {
    opacity: 1;
    cursor: pointer;
}

.tdesign-demo-image-viewer__ui-image--img {
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 100%;
    cursor: pointer;
    position: absolute;
}

.tdesign-demo-image-viewer__base {
    width: 120px;
    height: 120px;
    margin: 0;
    border: 1px solid var(--td-bg-color-secondarycontainer);
    border-radius: var(--td-radius-medium);
}
</style>