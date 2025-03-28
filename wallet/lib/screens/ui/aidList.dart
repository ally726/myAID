import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:wallet/utils/apiWrapper.dart';
import 'package:wallet/utils/clipboard.dart';
import 'package:wallet/utils/rsa.dart';

import '../../components/msg.dart';
import '../../models/aid.dart';

Consumer<AIDListModel> aidListView() {
  return Consumer<AIDListModel>(
    builder: (context, aidListModel, child) {
      return Container(
        color: Colors.grey[100],
        child: ListView.separated(
          itemCount: aidListModel.aidCount,
          separatorBuilder: (context, index) => Divider(
            color: Colors.grey[300],
            height: 1.0,
          ),
          itemBuilder: (context, index) {
            final aid = aidListModel.aidList[index];
            return Container(
              color: Colors.white,
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            aid.name,
                            style: const TextStyle(
                              color: Colors.black,
                              fontSize: 18.0,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 8.0),
                          Text(
                            aid.description,
                            style: const TextStyle(color: Colors.grey),
                          ),
                          const SizedBox(height: 4.0),
                          Row(
                            children: [
                              Text(
                                aid.aid.length > 12
                                    ? '${aid.aid.substring(0, 12)}...'
                                    : aid.aid,
                                style: const TextStyle(
                                    color: Colors.grey, fontSize: 12.0),
                              ),
                              IconButton(
                                icon: const Icon(Icons.copy, size: 16),
                                color: Colors.grey,
                                padding: EdgeInsets.zero,
                                constraints: const BoxConstraints(),
                                onPressed: () async {
                                  try {
                                    await copyWriteString(aid.aid);
                                    if (context.mounted) {
                                      showSuccessToast(context,
                                          'AID UUID copied to clipboard');
                                    }
                                  } catch (e) {
                                    if (context.mounted) {
                                      showErrorToast(
                                          context, "Failed to copy UUID: $e");
                                    }
                                  }
                                },
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 16.0),
                    ElevatedButton(
                      onPressed: () async {
                        // 實現登錄邏輯
                        try {
                          final key =
                              RSAUtils.parsePrivateKeyFromPem(aid.privateKey);
                          final response = await apiWrapper.login(aid.aid, key);
                          if (context.mounted) {
                            if (response['result']) {
                              showSuccessToast(context, 'Login success');
                            } else {
                              throw Exception(response['content']);
                            }
                          }
                        } catch (e) {
                          if (context.mounted) {
                            showErrorToast(context, "throw error msg:$e");
                          }
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20.0),
                        ),
                      ),
                      child: const Text('Login'),
                    ),
                    const SizedBox(width: 16.0),
                    IconButton(
                      icon: const Icon(Icons.copy),
                      color: Colors.grey,
                      onPressed: () async {
                        // 實現複製邏輯
                        try {
                          final key =
                              RSAUtils.parsePrivateKeyFromPem(aid.privateKey);
                          final response = await apiWrapper.login(aid.aid, key);
                          if (context.mounted) {
                            if (response['result']) {
                              await copyWriteString(response['content']);
                              if (context.mounted) {
                                showSuccessToast(context, 'MFA token: 限制時間內有效');
                              }
                            } else {
                              throw Exception(response['content']);
                            }
                          }
                        } catch (e) {
                          if (context.mounted) {
                            showErrorToast(context, "throw error msg:$e");
                          }
                        }
                      },
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      );
    },
  );
}
