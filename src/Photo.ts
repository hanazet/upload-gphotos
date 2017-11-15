import GPhotos from './';

export default class GPhotosPhoto {
  public id: string;
  public uploadedAt: Date;
  public createdAt: Date;
  public type = 'photo';
  public title: string;
  public description: string;
  public length: number;
  public width: number;
  public height: number;
  public fileSize: number;
  public rawUrl: string;
  private _uploadInfo: any;
  private _gphotos: GPhotos;

  get uploadInfo() {
    return this._uploadInfo;
  }
  set uploadInfo(info: any) {
    Object.defineProperty(this, '_uploadInfo', info);
  }
  get gphotos() {
    return this._gphotos;
  }
  set gphotos(gphotos: GPhotos) {
    Object.defineProperty(this, '_gphotos', gphotos);
  }

  constructor(opts: Partial<GPhotosPhoto>) {
    Object.assign(this, opts);
  }

  static parseInfo(data: any) {
    const lastIdx = data.length - 1;
    const type =
      !data[lastIdx] || typeof data[lastIdx] !== 'object'
        ? 'photo'
        : '76647426' in data[lastIdx] ? 'video' : '139842850' in data[lastIdx] ? 'animation_gif' : 'photo';

    return {
      id: data[0],
      createdAt: new Date(data[2]),
      uploadedAt: new Date(data[5]),
      type: type,
      length: type === 'video' ? data[lastIdx]['76647426'][0] : null,
      width: type === 'video' ? data[lastIdx]['76647426'][2] : data[1][1],
      height: type === 'video' ? data[lastIdx]['76647426'][3] : data[1][2],
      rawUrl: data[1][0],
    } as Partial<GPhotosPhoto>;
  }

  async removeFromAlbum() {
    const query = [[this.id], []];
    await this.gphotos.sendMutateQuery(85381832, query, true);
    return true;
  }

  async remove() {
    const query = [[], 1, [this.id], 4, null, []];
    await this.gphotos.sendMutateQuery(73931313, query, true);
    return true;
  }

  async fetchInfo() {
    const queries: Record<string, any[]> = {
      '73756775': [this.id, 1],
      '74881883': [this.id, null, null, true],
    };

    const results = await Promise.all(
      Object.keys(queries).map(key => this.gphotos.sendDataQuery(parseInt(key, 10), queries[key]))
    );

    this.description = results[0][0][1];
    this.title = results[0][0][2];
    this.fileSize = results[0][0][5];

    const info = GPhotosPhoto.parseInfo(results[1][0]);
    Object.assign(this, info);

    return this;
  }

  async modifyCreatedDate(createdDate: Date, timezoneSec?: number) {
    const diffTime = Math.round((new Date(createdDate).getTime() - this.createdAt.getTime()) / 1000);
    const query = [[[this.id, null, timezoneSec || null, diffTime]]];
    await this.gphotos.sendMutateQuery(115094896, query, true);
    await this.fetchInfo();
    return true;
  }

  async modifyDescription(description: string) {
    const query = [null, description, this.id];
    await this.gphotos.sendMutateQuery(74747338, query, true);
    await this.fetchInfo();
    return true;
  }
}
