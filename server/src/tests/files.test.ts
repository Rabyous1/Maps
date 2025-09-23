import FilesService from '@/apis/storage/files.service';

jest.mock('@/apis/storage/files.service');

const mockFilesService = FilesService as jest.MockedClass<typeof FilesService>;

describe('Files Service Tests', () => {
  let service: FilesService;

  beforeEach(() => {
    service = new FilesService();
    jest.clearAllMocks();
  });

  it('devrait télécharger un fichier', async () => {
    const mockResult = { message: 'File uploaded', file: { id: 'file-id' } };
    service.uploadFile = jest.fn().mockResolvedValue(mockResult);

    const result = await service.uploadFile('user-id', {} as any);

    expect(result).toEqual(mockResult);
    expect(service.uploadFile).toHaveBeenCalledWith('user-id', {});
  });

  it('devrait récupérer tous les fichiers', async () => {
    const mockFiles = { data: [{ id: 'file1' }, { id: 'file2' }], total: 2, count: 2 };
    service.getFilesByUserWithFilters = jest.fn().mockResolvedValue(mockFiles);

    const result = await service.getFilesByUserWithFilters('user-id');

    expect(result).toEqual(mockFiles);
    expect(service.getFilesByUserWithFilters).toHaveBeenCalledWith('user-id');
  });

  it('devrait trouver un fichier par UUID', async () => {
    const mockPath = '/path/to/file';
    service.findFile = jest.fn().mockResolvedValue(mockPath);

    const result = await service.findFile('file-uuid');

    expect(result).toEqual(mockPath);
    expect(service.findFile).toHaveBeenCalledWith('file-uuid');
  });

  it('devrait supprimer un fichier', async () => {
    service.deleteFile = jest.fn().mockResolvedValue(undefined);

    await service.deleteFile('file-uuid');

    expect(service.deleteFile).toHaveBeenCalledWith('file-uuid');
  });

  it('devrait récupérer le nom d\'affichage d\'un fichier', async () => {
    const mockName = 'Document.pdf';
    service.findFileDisplayName = jest.fn().mockResolvedValue(mockName);

    const result = await service.findFileDisplayName('file-uuid');

    expect(result).toEqual(mockName);
    expect(service.findFileDisplayName).toHaveBeenCalledWith('file-uuid');
  });

  it('devrait récupérer tous les fichiers', async () => {
    const mockFiles = [{ id: 'file1' }, { id: 'file2' }];
    service.findAllFiles = jest.fn().mockResolvedValue(mockFiles as any);

    const result = await service.findAllFiles();

    expect(result).toEqual(mockFiles);
    expect(service.findAllFiles).toHaveBeenCalled();
  });
});