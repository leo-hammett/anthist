import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Pressable,
  useColorScheme,
  Alert,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useFeedStore, Content, ContentStatus } from '../../lib/store/feedStore';

type FilterType = 'all' | 'active' | 'hidden';

export default function ContentListScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const { contents, hideContent, unhideContent, deleteContent } = useFeedStore();
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);

  const filteredContents = useMemo(() => {
    return contents.filter(c => {
      if (c.status === 'DELETED') return false;
      if (filter === 'active') return c.status === 'ACTIVE';
      if (filter === 'hidden') return c.status === 'HIDDEN';
      return true;
    });
  }, [contents, filter]);

  const handleLongPress = (id: string) => {
    setIsSelecting(true);
    setSelectedIds(new Set([id]));
  };

  const handlePress = (id: string) => {
    if (isSelecting) {
      const newSelected = new Set(selectedIds);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      setSelectedIds(newSelected);
      if (newSelected.size === 0) {
        setIsSelecting(false);
      }
    }
  };

  const handleHideSelected = () => {
    Alert.alert(
      'Hide Content',
      `Hide ${selectedIds.size} item(s)? They won't appear in your feed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Hide',
          onPress: async () => {
            for (const id of selectedIds) {
              await hideContent(id);
            }
            setSelectedIds(new Set());
            setIsSelecting(false);
          },
        },
      ]
    );
  };

  const handleUnhideSelected = () => {
    Alert.alert(
      'Unhide Content',
      `Show ${selectedIds.size} item(s) in your feed again?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unhide',
          onPress: async () => {
            for (const id of selectedIds) {
              await unhideContent(id);
            }
            setSelectedIds(new Set());
            setIsSelecting(false);
          },
        },
      ]
    );
  };

  const handleDeleteSelected = () => {
    Alert.alert(
      'Delete Content',
      `Delete ${selectedIds.size} item(s) permanently?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            for (const id of selectedIds) {
              await deleteContent(id);
            }
            setSelectedIds(new Set());
            setIsSelecting(false);
          },
        },
      ]
    );
  };

  const cancelSelection = () => {
    setSelectedIds(new Set());
    setIsSelecting(false);
  };

  const renderItem = ({ item }: { item: Content }) => {
    const isSelected = selectedIds.has(item.id);
    const isHidden = item.status === 'HIDDEN';

    return (
      <Pressable
        style={[
          styles.item,
          isDark && styles.itemDark,
          isSelected && styles.itemSelected,
          isHidden && styles.itemHidden,
        ]}
        onPress={() => handlePress(item.id)}
        onLongPress={() => handleLongPress(item.id)}
      >
        {/* Thumbnail */}
        <View style={styles.thumbnail}>
          {item.thumbnail ? (
            <Image source={{ uri: item.thumbnail }} style={styles.thumbnailImage} />
          ) : (
            <View style={[styles.thumbnailPlaceholder, isDark && styles.thumbnailPlaceholderDark]}>
              <Text style={styles.thumbnailEmoji}>
                {item.type === 'YOUTUBE' ? '🎬' : item.type === 'PDF' ? '📄' : '📝'}
              </Text>
            </View>
          )}
        </View>

        {/* Content info */}
        <View style={styles.itemContent}>
          <Text 
            style={[styles.itemTitle, isDark && styles.itemTitleDark]} 
            numberOfLines={2}
          >
            {item.title}
          </Text>
          <View style={styles.itemMeta}>
            <Text style={[styles.itemType, isDark && styles.itemTypeDark]}>
              {item.type === 'YOUTUBE' ? 'Video' : item.type === 'PDF' ? 'PDF' : 'Article'}
            </Text>
            {isHidden && (
              <Text style={styles.hiddenBadge}>Hidden</Text>
            )}
            {item.completionRate > 0 && (
              <Text style={[styles.itemProgress, isDark && styles.itemProgressDark]}>
                {Math.round(item.completionRate * 100)}% read
              </Text>
            )}
          </View>
        </View>

        {/* Selection indicator */}
        {isSelecting && (
          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
            {isSelected && <Text style={styles.checkmark}>✓</Text>}
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.titleDark]}>My Content</Text>
        {isSelecting ? (
          <Pressable onPress={cancelSelection} style={styles.headerButton}>
            <Text style={[styles.headerButtonText, isDark && styles.headerButtonTextDark]}>
              Cancel
            </Text>
          </Pressable>
        ) : (
          <Pressable onPress={() => router.back()} style={styles.headerButton}>
            <Text style={[styles.headerButtonText, isDark && styles.headerButtonTextDark]}>
              Done
            </Text>
          </Pressable>
        )}
      </View>

      {/* Filter tabs */}
      <View style={styles.filterContainer}>
        {(['all', 'active', 'hidden'] as FilterType[]).map((f) => (
          <Pressable
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text 
              style={[
                styles.filterTabText, 
                isDark && styles.filterTabTextDark,
                filter === f && styles.filterTabTextActive,
              ]}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Content list */}
      <FlatList
        data={filteredContents}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
              {filter === 'hidden' ? 'No hidden content' : 'No content yet'}
            </Text>
          </View>
        }
      />

      {/* Selection actions */}
      {isSelecting && selectedIds.size > 0 && (
        <View style={[styles.actionBar, isDark && styles.actionBarDark]}>
          <Pressable style={styles.actionButton} onPress={handleHideSelected}>
            <Text style={styles.actionButtonText}>Hide</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={handleUnhideSelected}>
            <Text style={styles.actionButtonText}>Unhide</Text>
          </Pressable>
          <Pressable style={[styles.actionButton, styles.actionButtonDanger]} onPress={handleDeleteSelected}>
            <Text style={[styles.actionButtonText, styles.actionButtonTextDanger]}>Delete</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  containerDark: {
    backgroundColor: '#0A0A0A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
  titleDark: {
    color: '#FFFFFF',
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  headerButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#3B82F6',
  },
  headerButtonTextDark: {
    color: '#60A5FA',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  filterTabActive: {
    backgroundColor: '#3B82F6',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterTabTextDark: {
    color: '#9CA3AF',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  itemDark: {
    backgroundColor: '#1A1A1A',
  },
  itemSelected: {
    backgroundColor: '#EFF6FF',
  },
  itemHidden: {
    opacity: 0.6,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailPlaceholderDark: {
    backgroundColor: '#2D2D2D',
  },
  thumbnailEmoji: {
    fontSize: 24,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  itemTitleDark: {
    color: '#F3F4F6',
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemType: {
    fontSize: 12,
    color: '#6B7280',
  },
  itemTypeDark: {
    color: '#9CA3AF',
  },
  hiddenBadge: {
    fontSize: 11,
    color: '#F59E0B',
    fontWeight: '600',
  },
  itemProgress: {
    fontSize: 12,
    color: '#10B981',
  },
  itemProgressDark: {
    color: '#34D399',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyTextDark: {
    color: '#9CA3AF',
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  actionBarDark: {
    backgroundColor: '#1A1A1A',
    borderTopColor: '#333',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  actionButtonDanger: {
    backgroundColor: '#FEE2E2',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  actionButtonTextDanger: {
    color: '#DC2626',
  },
});
