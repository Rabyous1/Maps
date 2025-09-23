import FilesService from '@/apis/storage/files.service';

jest.mock('@/apis/storage/files.service');

describe('FilesService - Tests Unitaires', () => {
  let service: FilesService;

  beforeEach(() => {
    service = new FilesService();
    jest.clearAllMocks();
  });

  describe('uploadFile - Validation', () => {
    it('devrait rejeter si utilisateur inexistant', async () => {
      service.uploadFile = jest.fn().mockRejectedValue(new Error('User not found'));

      await expect(service.uploadFile('invalid-user', {} as any))
        .rejects.toThrow('User not found');
    });

    it('devrait rejeter si utilisateur non autorisé', async () => {
      service.uploadFile = jest.fn().mockRejectedValue(new Error('User is not authorized to upload files'));

      await expect(service.uploadFile('unauthorized-user', {} as any))
        .rejects.toThrow('User is not authorized to upload files');
    });

    it('devrait accepter upload valide', async () => {
      const mockResult = { message: 'File uploaded successfully', file: { id: 'file-id' } };
      service.uploadFile = jest.fn().mockResolvedValue(mockResult);

      const result = await service.uploadFile('valid-user', {} as any);

      expect(result).toEqual(mockResult);
      expect(service.uploadFile).toHaveBeenCalledWith('valid-user', {});
    });
  });

  describe('deleteFile - Gestion erreurs', () => {
    it('devrait rejeter si fichier inexistant', async () => {
      service.deleteFile = jest.fn().mockRejectedValue(new Error('File not found'));

      await expect(service.deleteFile('invalid-uuid'))
        .rejects.toThrow('File not found');
    });

    it('devrait rejeter si fichier utilisé', async () => {
      service.deleteFile = jest.fn().mockRejectedValue(new Error('Cannot delete file: it is used by 2 application(s)'));

      await expect(service.deleteFile('used-uuid'))
        .rejects.toThrow('Cannot delete file: it is used by 2 application(s)');
    });

    it('devrait supprimer fichier non utilisé', async () => {
      service.deleteFile = jest.fn().mockResolvedValue(undefined);

      await expect(service.deleteFile('unused-uuid')).resolves.not.toThrow();
      expect(service.deleteFile).toHaveBeenCalledWith('unused-uuid');
    });
  });

  describe('findFile - Recherche', () => {
    it('devrait retourner chemin si fichier existe', async () => {
      const mockPath = '/path/to/file.pdf';
      service.findFile = jest.fn().mockResolvedValue(mockPath);

      const result = await service.findFile('valid-uuid');

      expect(result).toBe(mockPath);
      expect(service.findFile).toHaveBeenCalledWith('valid-uuid');
    });

    it('devrait rejeter si fichier inexistant', async () => {
      service.findFile = jest.fn().mockRejectedValue(new Error('File not found'));

      await expect(service.findFile('invalid-uuid'))
        .rejects.toThrow('File not found');
    });
  });

  describe('getFilesByUserWithFilters - Pagination', () => {
    it('devrait retourner fichiers paginés', async () => {
      const mockResult = {
        data: [{ id: 'file1' }, { id: 'file2' }],
        total: 10,
        count: 2
      };
      service.getFilesByUserWithFilters = jest.fn().mockResolvedValue(mockResult);

      const result = await service.getFilesByUserWithFilters('user-id', {}, 2, 0);

      expect(result).toEqual(mockResult);
      expect(service.getFilesByUserWithFilters).toHaveBeenCalledWith('user-id', {}, 2, 0);
    });

    it('devrait gérer filtres vides', async () => {
      const mockResult = { data: [], total: 0, count: 0 };
      service.getFilesByUserWithFilters = jest.fn().mockResolvedValue(mockResult);

      const result = await service.getFilesByUserWithFilters('user-id');

      expect(result).toEqual(mockResult);
    });
  });

  describe('findFileDisplayName - Métadonnées', () => {
    it('devrait retourner nom affichage si existe', async () => {
      const mockName = 'Document Important.pdf';
      service.findFileDisplayName = jest.fn().mockResolvedValue(mockName);

      const result = await service.findFileDisplayName('file-uuid');

      expect(result).toBe(mockName);
    });

    it('devrait retourner null si pas de nom', async () => {
      service.findFileDisplayName = jest.fn().mockResolvedValue(null);

      const result = await service.findFileDisplayName('file-uuid');

      expect(result).toBeNull();
    });
  });

  describe('findAllFiles - Liste complète', () => {
    it('devrait retourner tous les fichiers', async () => {
      const mockFiles = [
        { id: 'file1', name: 'doc1.pdf' },
        { id: 'file2', name: 'doc2.pdf' }
      ];
      service.findAllFiles = jest.fn().mockResolvedValue(mockFiles as any);

      const result = await service.findAllFiles();

      expect(result).toEqual(mockFiles);
      expect(service.findAllFiles).toHaveBeenCalled();
    });

    it('devrait gérer liste vide', async () => {
      service.findAllFiles = jest.fn().mockResolvedValue([]);

      const result = await service.findAllFiles();

      expect(result).toEqual([]);
    });
  });
});