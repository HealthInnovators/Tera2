
'use server';

import { db, testDatabaseConnection } from '@/lib/db';
import { PoolClient } from 'pg';
import type { Language, Message } from '@/lib/types';

/**
 * Retrieves an existing conversation by session_id or creates a new one.
 * @param sessionId A unique identifier for the client session.
 * @param initialLanguage The initial language of the conversation.
 * @returns The database ID of the conversation.
 */
export async function getOrCreateConversation(
  sessionId: string,
  initialLanguage: Language
): Promise<{ id: number; error?: string }> {
  try {
    const pool = await db.getPostgresPool();
    if (!pool) {
      return { id: -1, error: 'Database pool not initialized' };
    }
    const client = await pool.connect();
    try {
      // Test database connection first
      const isConnected = await testDatabaseConnection();
      if (!isConnected) {
        return { id: -1, error: 'Database connection failed' };
      }

      // Check if conversation exists
      const selectQuery = 'SELECT id FROM conversations WHERE session_id = $1';
      const selectResult = await client.query(selectQuery, [sessionId]);

      if (selectResult.rows.length > 0) {
        // Update last_activity_at
        const updateQuery = 'UPDATE conversations SET last_activity_at = NOW() WHERE id = $1';
        await client.query(updateQuery, [selectResult.rows[0].id]);
        return { id: selectResult.rows[0].id };
      } else {
        // Create new conversation
        const insertQuery = `
          INSERT INTO conversations (session_id, initial_language, started_at, last_activity_at)
          VALUES ($1, $2, NOW(), NOW())
          RETURNING id;
        `;
        const insertResult = await client.query(insertQuery, [sessionId, initialLanguage]);
        if (insertResult.rows.length > 0) {
          return { id: insertResult.rows[0].id };
        } else {
          return { id: -1, error: 'Failed to create conversation.' };
        }
      }
  } catch (e: unknown) {
    console.error('Error in getOrCreateConversation:', e);
    const errorMessage = e instanceof Error ? e.message : 'Unknown database error.';
    return { id: -1, error: `Failed to create conversation: ${errorMessage}` };
  } finally {
    if (client) {
      client.release();
    }
  }
}

/**
 * Adds a message to a specific conversation.
 * @param messageData The message object to save.
 * @returns The database ID of the newly created message.
 */
export async function addMessageToConversation(
  messageData: Omit<Message, 'id' | 'timestamp' | 'dbId'> & { conversationDbId: number }
): Promise<{ success: boolean; messageDbId?: number; error?: string }> {
  try {
    const pool = await db.getPostgresPool();
    const client = await pool.connect();
    try {
      const {
        conversationDbId,
        sender,
        text,
        language,
        isEligibilityResult,
        eligibility,
      } = messageData;

      const queryText = `
        INSERT INTO messages (conversation_id, sender_type, content, language, timestamp, is_eligibility_result, eligibility_is_eligible, eligibility_details)
        VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7)
        RETURNING id;
      `;
      const values = [
        conversationDbId,
        sender,
        text,
        language || null,
        isEligibilityResult || false,
        eligibility?.isEligible || null,
        eligibility?.details || null,
      ];

      const result = await client.query(queryText, values);
      if (result.rows.length > 0) {
        // Update conversation's last_activity_at
        const updateConvQuery = 'UPDATE conversations SET last_activity_at = NOW() WHERE id = $1';
        await client.query(updateConvQuery, [conversationDbId]);
        return { success: true, messageDbId: result.rows[0].id };
      } else {
        return { success: false, error: 'Failed to save message. No rows affected.' };
      }
    } catch (e: unknown) {
      console.error('Error saving message to PostgreSQL:', e);
      const errorMessage = e instanceof Error ? e.message : 'Unknown database error.';
      return { success: false, error: `Failed to save message: ${errorMessage}` };
    } finally {
      if (client) {
        client.release();
      }
    }
  } catch (e: unknown) {
    console.error('Error in addMessageToConversation:', e);
    const errorMessage = e instanceof Error ? e.message : 'Unknown database error.';
    return { success: false, error: `Failed to save message: ${errorMessage}` };
  }
}

/**
 * Links a lead_id to a conversation.
 * @param leadId The ID of the lead.
 * @param conversationId The ID of the conversation.
 * @returns Success status.
 */
export async function linkLeadToConversation(
  leadId: number,
  conversationId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const pool = await db.getPostgresPool();
    const client = await pool.connect();
    try {
      const queryText = `
        UPDATE conversations
        SET lead_id = $1, last_activity_at = NOW()
        WHERE id = $2;
      `;
      const values = [leadId, conversationId];

      const result = await client.query(queryText, values);
      if (result.rowCount !== null && result.rowCount > 0) {
        return { success: true };
      } else {
        // This could happen if conversationId doesn't exist, though unlikely in normal flow
        return { success: false, error: 'Failed to link lead to conversation. Conversation not found or no rows updated.' };
      }
    } catch (e: unknown) {
      console.error('Error linking lead to conversation:', e);
      const errorMessage = e instanceof Error ? e.message : 'Unknown database error.';
      return { success: false, error: `Database error: ${errorMessage}` };
    } finally {
      if (client) {
        client.release();
      }
    }
  } catch (e: unknown) {
    console.error('Error in linkLeadToConversation:', e);
    const errorMessage = e instanceof Error ? e.message : 'Unknown database error.';
    return { success: false, error: `Database error: ${errorMessage}` };
  }
}

/**
 * Retrieves all messages for a given conversation ID.
 * @param conversationDbId The database ID of the conversation.
 * @returns An array of messages.
 */
export async function getMessagesForConversation(
  conversationDbId: number
): Promise<{ messages: Message[]; error?: string }> {
  try {
    const pool = await db.getPostgresPool();
    if (!pool) {
      return { messages: [], error: 'Database pool not initialized' };
    }
    const client = await pool.connect();
    try {
      const queryText = `
        SELECT id, conversation_id, sender_type, content, language, timestamp, 
               is_eligibility_result, eligibility_is_eligible, eligibility_details
        FROM messages
        WHERE conversation_id = $1
        ORDER BY timestamp ASC;
      `;
      const result = await client.query(queryText, [conversationDbId]);
      
      const messages = result.rows.map((row: any): Message => ({
        id: row.id.toString(),
        dbId: row.id,
        conversationDbId: row.conversation_id,
        text: row.content,
        sender: row.sender_type,
        timestamp: new Date(row.timestamp),
        language: row.language as Language,
        isEligibilityResult: row.is_eligibility_result,
        eligibility: row.eligibility_is_eligible !== null
          ? {
              isEligible: row.eligibility_is_eligible as boolean,
              details: row.eligibility_details as string
            }
          : undefined
      }));
      
      return { messages };
    } catch (e: unknown) {
      console.error('Error retrieving messages from PostgreSQL:', e);
      const errorMessage = e instanceof Error ? e.message : 'Unknown database error.';
      return { messages: [], error: `Failed to retrieve messages: ${errorMessage}` };
    } finally {
      if (client) {
        client.release();
      }
    }
  } catch (e: unknown) {
    console.error('Error in getMessagesForConversation:', e);
    const errorMessage = e instanceof Error ? e.message : 'Unknown database error.';
    return { messages: [], error: `Failed to retrieve messages: ${errorMessage}` };
  }
}
